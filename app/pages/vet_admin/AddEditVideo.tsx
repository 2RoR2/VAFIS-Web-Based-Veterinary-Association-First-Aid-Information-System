import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut } from '../../services/api';
import { Video, Guide } from '../../types/content';
import { SPECIES_OPTIONS, CATEGORY_OPTIONS } from './mockData';

interface AddEditVideoPageProps {
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

const emptyForm: VideoForm = {
  title: '', species: '', category: '', difficulty: 'Beginner',
  duration: '', description: '', instructor: '', videoUrl: '', thumbnail: '', relatedGuideId: '',
};

// Add/edit form for a video tutorial record with fields for metadata, media URLs, and a linked first-aid guide.
export function AddEditVideoPage({ onNavigate, videoId }: AddEditVideoPageProps) {
  const isEdit = Boolean(videoId);
  const [form, setForm] = useState<VideoForm>(emptyForm);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [fetchError, setFetchError] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadGuides = apiGet<Guide[]>('/guides/admin').then(setGuides).catch(() => {});

    if (isEdit && videoId) {
      Promise.all([
        apiGet<Video>(`/videos/${videoId}`),
        loadGuides,
      ])
        .then(([v]) => {
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
        })
        .catch((err) => setFetchError(err.message ?? 'Failed to load video.'))
        .finally(() => setLoading(false));
    } else {
      loadGuides.finally(() => setLoading(false));
    }
  }, [isEdit, videoId]);

  // Updates a single field in the video form state by key.
  const updateField = <K extends keyof VideoForm>(key: K, value: VideoForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const isValid = form.title.trim() !== '' && form.species !== '' && form.category !== '' && form.duration.trim() !== '';

  // Validates required fields and POSTs a new video or PUTs an update, then navigates back to the video list.
  const handleSave = async () => {
    if (!isValid) { setError('Please fill in all required fields.'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: form.title.trim(),
        species: form.species,
        category: form.category,
        difficulty: form.difficulty,
        duration: form.duration.trim(),
        description: form.description.trim(),
        instructor: form.instructor.trim(),
        videoUrl: form.videoUrl.trim() || null,
        thumbnail: form.thumbnail.trim() || '',
        relatedGuideId: form.relatedGuideId || null,
      };

      if (isEdit && videoId) {
        await apiPut<Video>(`/videos/${videoId}`, payload);
      } else {
        await apiPost<Video>('/videos', payload);
      }

      onNavigate('admin-video-list');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save video.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground text-sm">Loading...</div>;

  if (fetchError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{fetchError}</p>
          <button onClick={() => onNavigate('admin-video-list')}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md">
            Back to Video List
          </button>
        </div>
      </div>
    );
  }

  const inputCls = 'w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary';
  const selectCls = `${inputCls} bg-white`;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">

        <button onClick={() => onNavigate('admin-video-list')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Video List
        </button>

        <h1 className="mb-1">{isEdit ? 'Edit Video' : 'Add New Video'}</h1>
        <p className="text-muted-foreground mb-8">
          {isEdit ? 'Update the details for this video tutorial.' : 'Fill in the details for the new video tutorial.'}
        </p>

        {error && (
          <div className="mb-6 rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
        )}

        <div className="space-y-6">

          <section className="bg-white rounded-lg border border-border p-6">
            <h2 className="mb-4">Video Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title <span className="text-destructive">*</span></label>
                <input type="text" value={form.title} onChange={(e) => updateField('title', e.target.value)} className={inputCls} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Species <span className="text-destructive">*</span></label>
                  <select value={form.species} onChange={(e) => updateField('species', e.target.value)} className={selectCls}>
                    <option value="">Select species</option>
                    {SPECIES_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category <span className="text-destructive">*</span></label>
                  <select value={form.category} onChange={(e) => updateField('category', e.target.value)} className={selectCls}>
                    <option value="">Select category</option>
                    {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Duration <span className="text-destructive">*</span></label>
                  <input type="text" value={form.duration} onChange={(e) => updateField('duration', e.target.value)}
                    placeholder="e.g. 4:32" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Difficulty</label>
                  <select value={form.difficulty} onChange={(e) => updateField('difficulty', e.target.value as VideoForm['difficulty'])} className={selectCls}>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Instructor</label>
                <input type="text" value={form.instructor} onChange={(e) => updateField('instructor', e.target.value)}
                  placeholder="e.g. Dr. Sarah Lim" className={inputCls} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)}
                  rows={3} className={`${inputCls} resize-none`} />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-lg border border-border p-6">
            <h2 className="mb-4">Media & Links</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Video URL</label>
                <input type="url" value={form.videoUrl} onChange={(e) => updateField('videoUrl', e.target.value)}
                  placeholder="https://..." className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
                <input type="url" value={form.thumbnail} onChange={(e) => updateField('thumbnail', e.target.value)}
                  placeholder="https://..." className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Link to Guide</label>
                <select value={form.relatedGuideId} onChange={(e) => updateField('relatedGuideId', e.target.value)} className={selectCls}>
                  <option value="">No guide linked</option>
                  {guides.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
                </select>
              </div>
            </div>
          </section>

        </div>

        <div className="flex justify-end gap-3 mt-8 pb-8">
          <button onClick={() => onNavigate('admin-video-list')}
            className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={!isValid || saving}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Video'}
          </button>
        </div>

      </div>
    </div>
  );
}
