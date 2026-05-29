import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiGet } from '../../services/api';
import { Guide } from '../../types/content';

interface ReviewQueuePageProps {
  onNavigate: (page: string, data?: any) => void;
}

const SPECIES_OPTIONS = ['Dogs', 'Cats', 'Birds', 'Rabbits', 'Hamsters', 'Fish', 'Reptiles'];

export function ReviewQueuePage({ onNavigate }: ReviewQueuePageProps) {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('all');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    apiGet<Guide[]>('/guides/pending-reviews', controller.signal)
      .then((data) => {
        setGuides(data);
        setError(null);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message ?? 'Failed to load guides.');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const filtered = guides.filter((g) => {
    const matchSearch = g.title.toLowerCase().includes(search.toLowerCase());
    const matchSpecies = speciesFilter === 'all' || g.species.includes(speciesFilter);
    return matchSearch && matchSpecies;
  });

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="mb-1">Review Queue</h1>
          <p className="text-muted-foreground">
            First-aid guides awaiting your clinical review.
            {!loading && <span className="ml-1 font-medium text-foreground">{filtered.length} pending</span>}
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
        </div>

        {/* Content */}
        {loading && (
          <div className="text-center py-16 text-muted-foreground text-sm">Loading guides...</div>
        )}

        {!loading && error && (
          <div className="text-center py-16 text-destructive text-sm">{error}</div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            {guides.length === 0 ? 'No guides are pending review.' : 'No guides match your filters.'}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Species</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date Submitted</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Assigned By</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((guide) => (
                  <tr
                    key={guide.id}
                    onClick={() => onNavigate('review-guide', { guideId: guide.id })}
                    className="hover:bg-muted/30 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{guide.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {guide.species.length > 0 ? guide.species.join(', ') : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(guide.submittedAt)}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                      {guide.createdBy ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('review-guide', { guideId: guide.id });
                        }}
                        className="px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-md hover:bg-primary/90 transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
