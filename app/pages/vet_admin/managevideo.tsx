import { Plus, Edit, Trash2, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiGet, apiDelete } from '../../services/api';
import { Video, Guide } from '../../types/content';
import { SPECIES_OPTIONS } from './mockData';

interface ManageVideoListPageProps {
  onNavigate: (page: string, data?: any) => void;
}

const DIFFICULTY_CLASSES: Record<string, string> = {
  Beginner: 'bg-success/15 text-success',
  Intermediate: 'bg-warning/20 text-warning',
  Advanced: 'bg-destructive/15 text-destructive',
};

export function ManageVideoListPage({ onNavigate }: ManageVideoListPageProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [speciesFilter, setSpeciesFilter] = useState('all');
  const [guideFilter, setGuideFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<Video | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      apiGet<Video[]>('/videos', controller.signal),
      apiGet<Guide[]>('/guides/admin', controller.signal),
    ])
      .then(([vids, guideList]) => { setVideos(vids); setGuides(guideList); setError(null); })
      .catch((err) => { if (err.name !== 'AbortError') setError(err.message ?? 'Failed to load data.'); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const filtered = videos.filter((v) => {
    const matchSpecies = speciesFilter === 'all' || v.species === speciesFilter;
    const matchGuide = guideFilter === 'all' || (guideFilter === 'none' ? !v.relatedGuideId : v.relatedGuideId === guideFilter);
    return matchSpecies && matchGuide;
  });

  const getLinkedGuideTitle = (guideId: string | null | undefined) => {
    if (!guideId) return null;
    return guides.find((g) => g.id === guideId)?.title ?? guideId;
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiDelete<{ message: string }>(`/videos/${deleteTarget.id}`);
      setVideos((prev) => prev.filter((v) => v.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete video.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="mb-1">Video Management</h1>
            <p className="text-muted-foreground">Manage all first-aid video tutorials on the platform.</p>
          </div>
          <button onClick={() => onNavigate('admin-video-add')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" />
            Add Video
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-border p-4 mb-5 flex items-center gap-3">
          <select value={speciesFilter} onChange={(e) => setSpeciesFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-white">
            <option value="all">All Species</option>
            {SPECIES_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select value={guideFilter} onChange={(e) => setGuideFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-white min-w-[220px]">
            <option value="all">All Linked Guides</option>
            <option value="none">No Linked Guide</option>
            {guides.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
          </select>

          <p className="text-sm text-muted-foreground ml-auto">
            {loading ? '…' : `${filtered.length} ${filtered.length === 1 ? 'video' : 'videos'} found`}
          </p>
        </div>

        {loading && <div className="text-center py-16 text-muted-foreground text-sm">Loading videos...</div>}
        {!loading && error && <div className="text-center py-16 text-destructive text-sm">{error}</div>}

        {!loading && !error && (
          filtered.length === 0 ? (
            <div className="bg-white rounded-lg border border-border p-12 text-center">
              <p className="text-muted-foreground">No videos match the selected filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((video) => (
                <div key={video.id}
                  className="bg-white rounded-lg border border-border p-4 flex items-center gap-4 hover:border-primary/40 transition-colors">
                  <div className="w-20 h-14 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                    <Play className="w-5 h-5 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm mb-1 truncate">{video.title}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 text-xs rounded bg-secondary text-secondary-foreground">{video.species}</span>
                      <span className="text-xs text-muted-foreground">{video.category}</span>
                      <span className={`px-2 py-0.5 text-xs rounded font-medium ${DIFFICULTY_CLASSES[video.difficulty] ?? 'bg-muted text-muted-foreground'}`}>
                        {video.difficulty}
                      </span>
                      <span className="text-xs text-muted-foreground">{video.duration}</span>
                    </div>
                  </div>

                  <div className="hidden lg:block text-sm text-muted-foreground w-36 flex-shrink-0 truncate">
                    {video.instructor}
                  </div>

                  <div className="hidden lg:block w-48 flex-shrink-0">
                    {getLinkedGuideTitle(video.relatedGuideId) ? (
                      <p className="text-xs text-primary truncate" title={getLinkedGuideTitle(video.relatedGuideId) ?? ''}>
                        {getLinkedGuideTitle(video.relatedGuideId)}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No guide linked</p>
                    )}
                  </div>

                  <div className="hidden lg:block text-sm text-muted-foreground w-20 text-right flex-shrink-0">
                    {video.views.toLocaleString()} views
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => onNavigate('admin-video-edit', { videoId: video.id })}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md hover:bg-muted transition-colors">
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button onClick={() => setDeleteTarget(video)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md hover:bg-destructive/10 text-destructive transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg border border-border p-6 w-full max-w-md shadow-lg">
            <h3 className="mb-2">Delete Video</h3>
            <p className="text-sm text-muted-foreground mb-1">Are you sure you want to delete:</p>
            <p className="text-sm font-medium mb-4">"{deleteTarget.title}"</p>
            <p className="text-sm text-destructive mb-6">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting}
                className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors">
                Cancel
              </button>
              <button onClick={confirmDelete} disabled={deleting}
                className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-50">
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
