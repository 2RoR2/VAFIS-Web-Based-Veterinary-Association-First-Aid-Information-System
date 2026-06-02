import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AuthUser } from '../AuthPage';
import { apiGet } from '../../services/api';
import { Guide } from '../../types/content';

interface ReviewHistoryPageProps {
  onNavigate: (page: string, data?: any) => void;
  currentUser: AuthUser | null;
}

const SPECIES_OPTIONS = ['Dogs', 'Cats', 'Birds', 'Rabbits', 'Hamsters', 'Fish', 'Reptiles'];

const REVIEWED_STATUSES = ['reviewed', 'revision_required', 'published'];

// Returns the human-readable outcome label for a given guide status string.
const outcomeLabel = (status: string) => {
  if (status === 'revision_required') return 'Changes Requested';
  if (status === 'published') return 'Approved & Published';
  return 'Approved';
};

// Returns the Tailwind badge class string for a given guide status outcome.
const outcomeClasses = (status: string) => {
  if (status === 'revision_required') return 'bg-yellow-100 text-yellow-700';
  if (status === 'published') return 'bg-blue-100 text-blue-700';
  return 'bg-green-100 text-green-700';
};

// Lists guides that the current veterinary professional has previously reviewed, with search and species filters.
export function ReviewHistoryPage({ onNavigate, currentUser }: ReviewHistoryPageProps) {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('all');

  useEffect(() => {
    // Wait until session is restored — avoids a race where currentUser is null
    // on mount (before authMe/authRefresh completes) causing the filter to return
    // empty, then the .finally() sets loading=false before the second run can set
    // it back to true.
    if (!currentUser) return;

    const controller = new AbortController();
    setLoading(true);
    apiGet<Guide[]>('/guides/admin', controller.signal)
      .then((data) => {
        const myReviewed = data.filter((g) => {
          if (!REVIEWED_STATUSES.includes(g.status ?? '')) return false;
          return (
            g.reviewedBy === currentUser.name ||
            g.reviewedBy === currentUser.email
          );
        });
        setGuides(myReviewed);
        setError(null);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message ?? 'Failed to load guides.');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [currentUser]);

  const filtered = guides.filter((g) => {
    const matchSearch = g.title.toLowerCase().includes(search.toLowerCase());
    const matchSpecies = speciesFilter === 'all' || g.species.includes(speciesFilter);
    return matchSearch && matchSpecies;
  });

  // Formats an ISO date string to a human-readable date in Malaysian locale, or returns '—' for missing dates.
  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="mb-1">Review History</h1>
          <p className="text-muted-foreground">
            Guides you have previously reviewed.
            {!loading && (
              <span className="ml-1 font-medium text-foreground">
                {filtered.length} {filtered.length === 1 ? 'guide' : 'guides'}
              </span>
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
        </div>

        {/* Content */}
        {loading && (
          <div className="text-center py-16 text-muted-foreground text-sm">Loading history...</div>
        )}

        {!loading && error && (
          <div className="text-center py-16 text-destructive text-sm">{error}</div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            {guides.length === 0
              ? 'You have not reviewed any guides yet.'
              : 'No guides match your filters.'}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Species</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date Reviewed</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Outcome</th>
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
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(guide.reviewedAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${outcomeClasses(guide.status ?? '')}`}>
                        {outcomeLabel(guide.status ?? '')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('review-guide', { guideId: guide.id });
                        }}
                        className="px-3 py-1.5 border border-border text-xs rounded-md hover:bg-muted transition-colors"
                      >
                        View
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
