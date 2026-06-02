import { Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPut } from '../../services/api';
import { FeedbackItem } from '../../types/content';

interface ManageFeedbackPageProps {
  onNavigate: (page: string, data?: any) => void;
}

type FeedbackStatus = 'New' | 'Reviewed' | 'Action Needed';

const STATUS_OPTIONS: FeedbackStatus[] = ['New', 'Reviewed', 'Action Needed'];

// Returns the Tailwind badge class string for a given feedback status string.
const getStatusClasses = (status: string) => {
  switch (status) {
    case 'New':           return 'bg-primary/10 text-primary';
    case 'Reviewed':      return 'bg-success/10 text-success';
    case 'Action Needed': return 'bg-warning/10 text-warning';
    default:              return 'bg-muted text-muted-foreground';
  }
};

// Renders a row of five star icons filled up to the given rating value.
const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        className={`w-3.5 h-3.5 ${n <= rating ? 'fill-warning text-warning' : 'text-muted-foreground/30'}`}
      />
    ))}
    <span className="text-xs text-muted-foreground ml-1">{rating}/5</span>
  </div>
);

// Formats an ISO date string to a short human-readable date in Malaysian locale, or returns '—' for missing dates.
const formatDate = (raw: string) => {
  if (!raw) return '—';
  try {
    return new Date(raw).toLocaleDateString('en-MY', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch {
    return raw;
  }
};

// Feedback review page showing all user-submitted feedback with type/rating filters, sort order, summary stats, and a per-item status selector.
export function ManageFeedbackPage({ onNavigate: _onNavigate }: ManageFeedbackPageProps) {
  const [items, setItems]               = useState<FeedbackItem[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [updatingId, setUpdatingId]     = useState<string | null>(null);

  // Filters
  const [typeFilter, setTypeFilter]     = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [sortOrder, setSortOrder]       = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    const controller = new AbortController();
    apiGet<FeedbackItem[]>('/feedback', controller.signal)
      .then((data) => { setItems(data); setError(null); })
      .catch((err) => { if (err.name !== 'AbortError') setError(err.message ?? 'Failed to load feedback.'); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  // Filters and sorts the feedback list by content type, rating, and date order.
  const filtered = useMemo(() => {
    let list = [...items];
    if (typeFilter)   list = list.filter((f) => f.contentType === typeFilter);
    if (ratingFilter) list = list.filter((f) => f.rating === Number(ratingFilter));
    list.sort((a, b) => {
      const da = new Date(a.submittedAt).getTime();
      const db = new Date(b.submittedAt).getTime();
      return sortOrder === 'newest' ? db - da : da - db;
    });
    return list;
  }, [items, typeFilter, ratingFilter, sortOrder]);

  // Computes total, new, and action-needed feedback counts for the summary cards.
  const counts = useMemo(() => ({
    total:        items.length,
    newCount:     items.filter((f) => f.status === 'New').length,
    actionCount:  items.filter((f) => f.status === 'Action Needed').length,
  }), [items]);

  // PUTs the updated status for a feedback item and updates it in local state.
  const handleStatusChange = async (id: string, newStatus: FeedbackStatus) => {
    setUpdatingId(id);
    try {
      const updated = await apiPut<FeedbackItem>(`/feedback/${id}/status`, { status: newStatus });
      setItems((prev) => prev.map((f) => (f.id === id ? { ...f, status: updated.status } : f)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  /* ── Render ────────────────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="mb-1">Feedback Review</h1>
          <p className="text-muted-foreground">
            Review feedback submitted by pet owners on guides and quizzes.
          </p>
        </div>

        {/* Summary cards */}
        {!loading && !error && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total Feedback', value: counts.total,       cls: 'text-foreground'   },
              { label: 'Awaiting Review', value: counts.newCount,    cls: 'text-primary'      },
              { label: 'Action Needed',   value: counts.actionCount, cls: 'text-warning'      },
            ].map(({ label, value, cls }) => (
              <div key={label} className="bg-white rounded-lg border border-border p-4 text-center">
                <p className={`text-2xl font-semibold mb-1 ${cls}`}>{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        {!loading && !error && items.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-5">
            {/* Content type */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 border border-border rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Types</option>
              <option value="Guide">Guide</option>
              <option value="Quiz">Quiz</option>
            </select>

            {/* Star rating */}
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-3 py-1.5 border border-border rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Ratings</option>
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>{'★'.repeat(r)}{'☆'.repeat(5 - r)} ({r})</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="px-3 py-1.5 border border-border rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>

            {(typeFilter || ratingFilter) && (
              <button
                onClick={() => { setTypeFilter(''); setRatingFilter(''); }}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* States */}
        {loading && (
          <div className="text-center py-16 text-muted-foreground text-sm">Loading feedback...</div>
        )}
        {!loading && error && (
          <div className="text-center py-16 text-destructive text-sm">{error}</div>
        )}

        {/* List */}
        {!loading && !error && (
          filtered.length === 0 ? (
            <div className="bg-white rounded-lg border border-border p-12 text-center">
              <p className="text-muted-foreground">
                {items.length === 0
                  ? 'No feedback has been submitted yet.'
                  : 'No feedback matches the selected filters.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg border border-border p-5 hover:border-primary/30 transition-colors"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-medium text-sm">{item.contentTitle}</p>
                        <span className="px-2 py-0.5 text-xs rounded bg-secondary text-secondary-foreground">
                          {item.contentType}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <StarRating rating={item.rating} />
                        <span className="text-xs text-muted-foreground">
                          by {item.submittedBy} · {formatDate(item.submittedAt)}
                        </span>
                      </div>
                    </div>

                    {/* Status selector */}
                    <div className="flex-shrink-0">
                      <select
                        value={item.status}
                        disabled={updatingId === item.id}
                        onChange={(e) => handleStatusChange(item.id, e.target.value as FeedbackStatus)}
                        className={`px-2 py-1 text-xs rounded-md border font-medium focus:outline-none focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50 ${getStatusClasses(item.status)} border-transparent`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Comment */}
                  {item.comment && (
                    <p className="text-sm text-muted-foreground border-t border-border pt-3 mt-1 leading-relaxed">
                      {item.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
