import { AlertTriangle, ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../services/api';
import { Guide } from '../../types/content';

interface ReviewGuidePageProps {
  onNavigate: (page: string, data?: any) => void;
  guideId?: string;
}

const severityClasses: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

const statusClasses: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  pending_review: 'bg-yellow-100 text-yellow-700',
  reviewed: 'bg-green-100 text-green-700',
  revision_required: 'bg-red-100 text-red-700',
  published: 'bg-blue-100 text-blue-700',
  archived: 'bg-muted text-muted-foreground',
};

const statusLabel: Record<string, string> = {
  draft: 'Draft',
  pending_review: 'Pending Review',
  reviewed: 'Reviewed',
  revision_required: 'Revision Required',
  published: 'Published',
  archived: 'Archived',
};

export function VetReviewGuidePage({ onNavigate, guideId = '' }: ReviewGuidePageProps) {
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [decision, setDecision] = useState<string | null>(null);

  useEffect(() => {
    if (!guideId) { setLoading(false); return; }
    const controller = new AbortController();
    setLoading(true);
    apiGet<Guide>(`/guides/${guideId}`, controller.signal)
      .then((data) => { setGuide(data); setFetchError(null); })
      .catch((err) => { if (err.name !== 'AbortError') setFetchError(err.message ?? 'Failed to load guide.'); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [guideId]);

  const submitReview = async (action: 'approve' | 'request_changes') => {
    if (action === 'request_changes' && !comments.trim()) {
      setSubmitError('Comments are required when requesting changes.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      await apiPost(`/guides/${guideId}/review`, { action, comments: comments.trim() || undefined });
      setDecision(action === 'approve' ? 'Approved' : 'Changes Requested');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back */}
        <button
          onClick={() => onNavigate('vet-review-queue')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Review Queue
        </button>

        {/* Loading / fetch error */}
        {loading && <p className="text-sm text-muted-foreground">Loading guide...</p>}
        {fetchError && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {fetchError}
          </div>
        )}
        {!loading && !fetchError && !guide && (
          <div className="bg-white rounded-lg border border-border p-6 text-center">
            <p className="text-muted-foreground">Guide not found.</p>
          </div>
        )}

        {guide && (
          <>
            {/* Title row */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h1>{guide.title}</h1>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusClasses[guide.status ?? 'draft']}`}>
                    {statusLabel[guide.status ?? 'draft']}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {guide.species.map((s) => (
                    <span key={s} className="px-2 py-0.5 text-xs rounded bg-secondary text-secondary-foreground">{s}</span>
                  ))}
                  <span className="text-xs text-muted-foreground">{guide.category}</span>
                  <span className={`px-2 py-0.5 text-xs rounded font-medium ${severityClasses[guide.severity]}`}>
                    {guide.severity.charAt(0).toUpperCase() + guide.severity.slice(1)} Severity
                  </span>
                  <span className="text-xs text-muted-foreground">{guide.readTime}</span>
                </div>
              </div>
              {guide.status === 'pending_review' && !decision && (
                <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 text-yellow-700 text-sm rounded-md flex-shrink-0">
                  <Clock className="w-4 h-4" />
                  Awaiting Your Review
                </div>
              )}
            </div>

            <div className="grid lg:grid-cols-[1fr_300px] gap-6">

              {/* Left: Guide content */}
              <div className="space-y-5">

                {/* Emergency scenario */}
                <section className="bg-white rounded-lg border border-border p-5">
                  <h3 className="mb-2">Emergency Scenario</h3>
                  <p className="text-sm text-muted-foreground">{guide.description}</p>
                </section>

                {/* Steps */}
                <section className="bg-white rounded-lg border border-border p-5">
                  <h3 className="mb-4">Step-by-Step Instructions</h3>
                  <ol className="space-y-4">
                    {guide.steps.map((step) => (
                      <li key={step.number} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                          {step.number}
                        </span>
                        <div>
                          <p className="text-sm font-medium">{step.title}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{step.description}</p>
                          {step.details && step.details.length > 0 && (
                            <ul className="mt-1.5 space-y-0.5 list-disc list-inside">
                              {step.details.map((d, i) => (
                                <li key={i} className="text-xs text-muted-foreground">{d}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>

                {/* Warnings */}
                {guide.warnings.length > 0 && (
                  <section className="bg-white rounded-lg border border-border p-5">
                    <h3 className="mb-3">Warnings</h3>
                    <ul className="space-y-2">
                      {guide.warnings.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{w}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Linked content */}
                <section className="bg-white rounded-lg border border-border p-5">
                  <h3 className="mb-3">Linked Content</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Linked Videos</p>
                      {guide.relatedVideos.length > 0
                        ? guide.relatedVideos.map((v) => (
                            <p key={v} className="font-mono text-xs text-foreground">{v}</p>
                          ))
                        : <p className="text-muted-foreground italic text-xs">None linked</p>}
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Related Guides</p>
                      {guide.relatedGuides.length > 0
                        ? guide.relatedGuides.map((g) => (
                            <p key={g} className="font-mono text-xs text-foreground">{g}</p>
                          ))
                        : <p className="text-muted-foreground italic text-xs">None linked</p>}
                    </div>
                  </div>
                </section>

              </div>

              {/* Right: Sidebar */}
              <div className="space-y-4">

                {/* Review decision panel */}
                <section className="bg-white rounded-lg border border-border p-5">
                  <h3 className="mb-4">Review Decision</h3>

                  {decision ? (
                    <div className="rounded-lg bg-secondary p-3 text-secondary-foreground text-sm mb-3">
                      Decision submitted: <strong>{decision}</strong>
                    </div>
                  ) : guide.status !== 'pending_review' ? (
                    <p className="text-sm text-muted-foreground">
                      This guide is not currently pending review.
                    </p>
                  ) : (
                    <>
                      {submitError && (
                        <div className="mb-3 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                          {submitError}
                        </div>
                      )}
                      <label className="block mb-4 text-sm">
                        <span className="text-muted-foreground">Review comments</span>
                        <textarea
                          rows={5}
                          className="mt-1.5 w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          placeholder="Add clinical notes or required corrections..."
                        />
                      </label>
                      <button
                        disabled={submitting}
                        onClick={() => submitReview('approve')}
                        className="w-full flex items-center justify-center gap-2 mb-2 px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-60 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {submitting ? 'Submitting…' : 'Approve'}
                      </button>
                      <button
                        disabled={submitting}
                        onClick={() => submitReview('request_changes')}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 text-white text-sm rounded-md hover:bg-yellow-600 disabled:opacity-60 transition-colors"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        {submitting ? 'Submitting…' : 'Request Changes'}
                      </button>
                    </>
                  )}
                </section>

                {/* Guide metadata */}
                <section className="bg-white rounded-lg border border-border p-5">
                  <h3 className="mb-3">Guide Details</h3>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Submitted</dt>
                      <dd className="font-medium">{formatDate(guide.submittedAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Assigned By</dt>
                      <dd className="font-mono text-xs break-all">{guide.createdBy ?? '—'}</dd>
                    </div>
                    {guide.reviewedAt && (
                      <div>
                        <dt className="text-muted-foreground">Last Reviewed</dt>
                        <dd className="font-medium">{formatDate(guide.reviewedAt)}</dd>
                      </div>
                    )}
                    {guide.reviewedBy && (
                      <div>
                        <dt className="text-muted-foreground">Reviewed By</dt>
                        <dd className="font-medium">{guide.reviewedBy}</dd>
                      </div>
                    )}
                    {guide.updatedAt && (
                      <div>
                        <dt className="text-muted-foreground">Last Updated</dt>
                        <dd className="font-medium">{formatDate(guide.updatedAt)}</dd>
                      </div>
                    )}
                  </dl>
                </section>

              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
