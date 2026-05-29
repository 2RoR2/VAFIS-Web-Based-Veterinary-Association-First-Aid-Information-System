import { ArrowLeft, Edit, Play, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AuthUser } from '../AuthPage';
import { apiGet, apiPut } from '../../services/api';
import { Guide, Video } from '../../types/content';

// ── Shared constants ─────────────────────────────────────────────────────────

const SPECIES_OPTIONS = ['Dogs', 'Cats', 'Birds', 'Rabbits', 'Hamsters', 'Guinea Pigs'];

const CATEGORY_OPTIONS = [
  'Choking', 'Bleeding', 'Burns', 'Fractures', 'Poisoning',
  'Seizures', 'Heatstroke', 'CPR', 'Eye Injury', 'Wound Care',
];

const DIFFICULTY_CLASSES: Record<string, string> = {
  Beginner: 'bg-green-100 text-green-700',
  Intermediate: 'bg-yellow-100 text-yellow-700',
  Advanced: 'bg-red-100 text-red-700',
};

// ── Video List ────────────────────────────────────────────────────────────────

interface VetVideoListPageProps {
  onNavigate: (page: string, data?: any) => void;
  currentUser: AuthUser | null;
}

export function VetVideoListPage({ onNavigate, currentUser }: VetVideoListPageProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [search, setSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('all');

  useEffect(() => {
    if (!currentUser) return;

    const controller = new AbortController();
    setLoading(true);

    Promise.all([
      apiGet<Guide[]>('/guides/admin', controller.signal),
      apiGet<Video[]>('/videos', controller.signal),
    ])
      .then(([guides, allVideos]) => {
        // Collect video IDs from guides reviewed by this vet
        const myGuides = guides.filter(
          (g) =>
            g.reviewedBy === currentUser.name || g.reviewedBy === currentUser.email,
        );

        const linkedVideoIds = new Set(myGuides.flatMap((g) => g.relatedVideos ?? []));

        // Also include videos whose relatedGuideId points to one of the vet's guides
        const myGuideIds = new Set(myGuides.map((g) => g.id));
        const matched = allVideos.filter(
          (v) => linkedVideoIds.has(v.id) || (v.relatedGuideId != null && myGuideIds.has(v.relatedGuideId)),
        );

        if (matched.length > 0) {
          setVideos(matched);
          setIsFallback(false);
        } else {
          // Fallback: show all videos for testing when no matches found
          setVideos(allVideos);
          setIsFallback(true);
        }
        setError(null);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message ?? 'Failed to load videos.');
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [currentUser]);

  const filtered = videos.filter((v) => {
    const matchSearch = v.title.toLowerCase().includes(search.toLowerCase());
    const matchSpecies = speciesFilter === 'all' || v.species === speciesFilter;
    return matchSearch && matchSpecies;
  });

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="mb-1">Videos</h1>
          <p className="text-muted-foreground">
            Educational videos linked to guides you are responsible for.
            {isFallback && (
              <span className="ml-1 text-yellow-600 text-xs">(Showing all videos — no guide matches found)</span>
            )}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-border p-4 mb-5 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            value={speciesFilter}
            onChange={(e) => setSpeciesFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-white"
          >
            <option value="all">All Species</option>
            {SPECIES_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {!loading && (
            <p className="text-sm text-muted-foreground flex items-center">
              {filtered.length} {filtered.length === 1 ? 'video' : 'videos'}
            </p>
          )}
        </div>

        {/* Content */}
        {loading && (
          <div className="text-center py-16 text-muted-foreground text-sm">Loading videos...</div>
        )}

        {!loading && error && (
          <div className="text-center py-16 text-destructive text-sm">{error}</div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            {videos.length === 0 ? 'No videos found.' : 'No videos match your filters.'}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((video) => (
              <div
                key={video.id}
                className="bg-white rounded-lg border border-border p-4 flex items-center gap-4 hover:border-primary/40 transition-colors"
              >
                {/* Thumbnail placeholder */}
                <div className="w-20 h-14 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                  <Play className="w-5 h-5 text-muted-foreground" />
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm mb-1 truncate">{video.title}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 text-xs rounded bg-secondary text-secondary-foreground">
                      {video.species}
                    </span>
                    <span className="text-xs text-muted-foreground">{video.category}</span>
                    <span className={`px-2 py-0.5 text-xs rounded font-medium ${DIFFICULTY_CLASSES[video.difficulty] ?? 'bg-muted text-muted-foreground'}`}>
                      {video.difficulty}
                    </span>
                    <span className="text-xs text-muted-foreground">{video.duration}</span>
                  </div>
                </div>

                {/* Instructor */}
                <div className="hidden lg:block text-sm text-muted-foreground w-36 flex-shrink-0 truncate">
                  {video.instructor}
                </div>

                {/* Views */}
                <div className="hidden lg:block text-sm text-muted-foreground w-24 text-right flex-shrink-0">
                  {video.views.toLocaleString()} views
                </div>

                {/* Edit action */}
                <div className="flex-shrink-0">
                  <button
                    onClick={() => onNavigate('vet-video-edit', { videoId: video.id })}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md hover:bg-muted transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

// ── Edit Video ────────────────────────────────────────────────────────────────

interface VetEditVideoPageProps {
  onNavigate: (page: string, data?: any) => void;
  videoId?: string;
}

interface VideoForm {
  title: string;
  species: string;
  category: string;
  difficulty: Video['difficulty'];
  duration: string;
  description: string;
  instructor: string;
  videoUrl: string;
  thumbnail: string;
  relatedGuideId: string;
}

export function VetEditVideoPage({ onNavigate, videoId = '' }: VetEditVideoPageProps) {
  const [video, setVideo] = useState<Video | null>(null);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [form, setForm] = useState<VideoForm>({
    title: '', species: '', category: '', difficulty: 'Beginner',
    duration: '', description: '', instructor: '', videoUrl: '', thumbnail: '', relatedGuideId: '',
  });

  useEffect(() => {
    if (!videoId) { setLoading(false); return; }
    const controller = new AbortController();

    Promise.all([
      apiGet<Video>(`/videos/${videoId}`, controller.signal),
      apiGet<Guide[]>('/guides/admin', controller.signal),
    ])
      .then(([v, g]) => {
        setVideo(v);
        setGuides(g);
        setForm({
          title: v.title,
          species: v.species,
          category: v.category,
          difficulty: v.difficulty,
          duration: v.duration,
          description: v.description,
          instructor: v.instructor,
          videoUrl: v.videoUrl ?? '',
          thumbnail: v.thumbnail ?? '',
          relatedGuideId: v.relatedGuideId ?? '',
        });
        setFetchError(null);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setFetchError(err.message ?? 'Failed to load video.');
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [videoId]);

  const updateField = <K extends keyof VideoForm>(key: K, value: VideoForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const isValid = form.title.trim() !== '' && form.species !== '' && form.category !== '';

  const handleSave = async () => {
    if (!isValid) return;
    setSaving(true);
    setSaveError(null);
    try {
      await apiPut<Video>(`/videos/${videoId}`, {
        title: form.title.trim(),
        species: form.species,
        category: form.category,
        difficulty: form.difficulty,
        duration: form.duration.trim(),
        description: form.description.trim(),
        instructor: form.instructor.trim(),
        videoUrl: form.videoUrl.trim() || null,
        thumbnail: form.thumbnail.trim() || null,
        relatedGuideId: form.relatedGuideId || null,
      });
      onNavigate('vet-videos');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save video.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading video...</p>
      </div>
    );
  }

  if (fetchError || (!loading && !video)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">{fetchError ?? 'Video not found.'}</p>
          <button
            onClick={() => onNavigate('vet-videos')}
            className="mt-4 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md"
          >
            Back to Video List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back */}
        <button
          onClick={() => onNavigate('vet-videos')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Video List
        </button>

        <h1 className="mb-1">Edit Video</h1>
        <p className="text-muted-foreground mb-8">
          Editing: <span className="font-medium text-foreground">{video?.title}</span>
        </p>

        <div className="space-y-6">

          {/* Basic Info */}
          <section className="bg-white rounded-lg border border-border p-6">
            <h2 className="mb-4">Basic Information</h2>
            <div className="space-y-4">

              <div>
                <label className="block text-sm font-medium mb-1">
                  Video Title <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="e.g. How to Handle Choking in Dogs"
                  className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Species <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={form.species}
                    onChange={(e) => updateField('species', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                  >
                    <option value="">Select species</option>
                    {SPECIES_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                  >
                    <option value="">Select category</option>
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Difficulty</label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => updateField('difficulty', e.target.value as Video['difficulty'])}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Duration</label>
                  <input
                    type="text"
                    value={form.duration}
                    onChange={(e) => updateField('duration', e.target.value)}
                    placeholder="e.g. 4:32"
                    className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Instructor Name</label>
                <input
                  type="text"
                  value={form.instructor}
                  onChange={(e) => updateField('instructor', e.target.value)}
                  placeholder="e.g. Dr. Sarah Lim"
                  className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

            </div>
          </section>

          {/* Content */}
          <section className="bg-white rounded-lg border border-border p-6">
            <h2 className="mb-4">Content Details</h2>
            <div className="space-y-4">

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Briefly describe what this video covers..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Video URL</label>
                <input
                  type="text"
                  value={form.videoUrl}
                  onChange={(e) => updateField('videoUrl', e.target.value)}
                  placeholder="https://example.com/videos/..."
                  className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
                <input
                  type="text"
                  value={form.thumbnail}
                  onChange={(e) => updateField('thumbnail', e.target.value)}
                  placeholder="https://example.com/thumbnails/..."
                  className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

            </div>
          </section>

          {/* Link to Guide */}
          <section className="bg-white rounded-lg border border-border p-6">
            <h2 className="mb-1">Link to First-Aid Guide</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Optionally associate this video with an existing first-aid guide.
            </p>
            <select
              value={form.relatedGuideId}
              onChange={(e) => updateField('relatedGuideId', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-white"
            >
              <option value="">No guide linked</option>
              {guides.map((g) => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
          </section>

        </div>

        {/* Footer actions */}
        {saveError && (
          <div className="mt-6 rounded-md border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">{saveError}</div>
        )}
        <div className="flex justify-end gap-3 mt-4 pb-8">
          <button
            onClick={() => onNavigate('vet-videos')}
            className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid || saving}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  );
}
