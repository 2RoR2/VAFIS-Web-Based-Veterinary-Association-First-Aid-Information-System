import { Eye, Edit, CheckCircle, Archive, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../services/api';
import { Guide } from '../../types/content';
import { SPECIES_OPTIONS, CATEGORY_OPTIONS, STATUS_LABELS, getStatusClasses, getSeverityClasses } from './mockData';

interface ManageGuideListPageProps {
  onNavigate: (page: string, data?: any) => void;
}

const ALL_STATUSES = ['draft', 'pending_review', 'revision_required', 'reviewed', 'published', 'archived'];

export function ManageGuideListPage({ onNavigate }: ManageGuideListPageProps) {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [speciesFilter, setSpeciesFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [archiving, setArchiving] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    apiGet<Guide[]>('/guides/admin', controller.signal)
      .then((data) => { setGuides(data); setError(null); })
      .catch((err) => { if (err.name !== 'AbortError') setError(err.message ?? 'Failed to load guides.'); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const handleArchive = async (guideId: string) => {
    setArchiving(guideId);
    try {
      const updated = await apiPost<Guide>(`/guides/${guideId}/archive`, {});
      setGuides((prev) => prev.map((g) => (g.id === guideId ? updated : g)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to archive guide.');
    } finally {
      setArchiving(null);
    }
  };

  const filtered = guides.filter((g) => {
    const matchSearch = g.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || g.status === statusFilter;
    const matchSpecies = speciesFilter === 'all' || g.species.includes(speciesFilter);
    const matchCategory = categoryFilter === 'all' || g.category === categoryFilter;
    return matchSearch && matchStatus && matchSpecies && matchCategory;
  });

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="mb-1">First-Aid Guide Management</h1>
            <p className="text-muted-foreground">Manage all first-aid guides — create, review, and publish content.</p>
          </div>
          <button
            onClick={() => onNavigate('admin-guide-create')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Guide
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-border p-4 mb-5 grid grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-white">
            <option value="all">All Statuses</option>
            {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
          <select value={speciesFilter} onChange={(e) => setSpeciesFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-white">
            <option value="all">All Species</option>
            {SPECIES_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-white">
            <option value="all">All Categories</option>
            {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {loading && <div className="text-center py-16 text-muted-foreground text-sm">Loading guides...</div>}
        {!loading && error && <div className="text-center py-16 text-destructive text-sm">{error}</div>}

        {!loading && !error && (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {filtered.length} {filtered.length === 1 ? 'guide' : 'guides'} found
            </p>

            {filtered.length === 0 ? (
              <div className="bg-white rounded-lg border border-border p-12 text-center">
                <p className="text-muted-foreground">No guides match the selected filters.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((guide) => (
                  <div key={guide.id}
                    className="bg-white rounded-lg border border-border p-4 flex items-center gap-4 hover:border-primary/40 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="truncate">{guide.title}</h4>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusClasses(guide.status || 'draft')}`}>
                          {STATUS_LABELS[guide.status || 'draft']}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityClasses(guide.severity)}`}>
                          {guide.severity.charAt(0).toUpperCase() + guide.severity.slice(1)} Severity
                        </span>
                        {guide.species.map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded text-xs bg-secondary text-secondary-foreground">{s}</span>
                        ))}
                        <span className="text-xs text-muted-foreground">{guide.category}</span>
                      </div>
                    </div>

                    <div className="hidden lg:block text-right text-xs text-muted-foreground w-32 flex-shrink-0">
                      {guide.updatedAt && (
                        <>
                          <p>Updated</p>
                          <p>{formatDate(guide.updatedAt)}</p>
                        </>
                      )}
                      {guide.reviewedBy && <p className="mt-1 truncate">{guide.reviewedBy}</p>}
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => onNavigate('admin-guide-detail', { guideId: guide.id })}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md hover:bg-muted transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>

                      {(guide.status === 'draft' || guide.status === 'revision_required') && (
                        <button onClick={() => onNavigate('admin-guide-edit', { guideId: guide.id })}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md hover:bg-muted transition-colors">
                          <Edit className="w-3.5 h-3.5" />
                          Edit
                        </button>
                      )}

                      {guide.status === 'reviewed' && (
                        <button onClick={() => onNavigate('admin-guide-approve', { guideId: guide.id })}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-success/15 text-success hover:bg-success/25 transition-colors">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Publish
                        </button>
                      )}

                      {(guide.status === 'published' || guide.status === 'draft' || guide.status === 'reviewed' || guide.status === 'revision_required') && (
                        <button
                          onClick={() => handleArchive(guide.id)}
                          disabled={archiving === guide.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md hover:bg-muted transition-colors text-muted-foreground disabled:opacity-50"
                        >
                          <Archive className="w-3.5 h-3.5" />
                          {archiving === guide.id ? '...' : 'Archive'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
