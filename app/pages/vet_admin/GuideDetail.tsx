import { ArrowLeft, Edit, CheckCircle, Archive, Clock, AlertTriangle, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../services/api';
import { Guide } from '../../types/content';
import { STATUS_LABELS, getStatusClasses, getSeverityClasses } from './mockData';

interface GuideDetailPageProps {
  onNavigate: (page: string, data?: any) => void;
  guideId?: string;
}

export function GuideDetailPage({ onNavigate, guideId }: GuideDetailPageProps) {
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [actionError, setActionError] = useState('');
  const [acting, setActing] = useState(false);

  useEffect(() => {
    if (!guideId) { setFetchError('No guide ID provided.'); setLoading(false); return; }
    const controller = new AbortController();
    apiGet<Guide>(`/guides/${guideId}`, controller.signal)
      .then((g) => { setGuide(g); setFetchError(''); })
      .catch((err) => { if (err.name !== 'AbortError') setFetchError(err.message ?? 'Failed to load guide.'); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [guideId]);

  const handleAction = async (action: () => Promise<Guide>) => {
    setActing(true);
    setActionError('');
    try {
      const updated = await action();
      setGuide(updated);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setActing(false);
    }
  };

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground text-sm">Loading guide...</div>;

  if (fetchError || !guide) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{fetchError || 'Guide not found.'}</p>
          <button onClick={() => onNavigate('admin-guide-list')}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md">
            Back to Guide List
          </button>
        </div>
      </div>
    );
  }

  const status = guide.status ?? 'draft';

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <button onClick={() => onNavigate('admin-guide-list')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Guide List
        </button>

        {actionError && (
          <div className="mb-4 rounded-md border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">{actionError}</div>
        )}

        {/* Title row */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h1>{guide.title}</h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusClasses(status)}`}>
                {STATUS_LABELS[status]}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {guide.species.map((s) => (
                <span key={s} className="px-2 py-0.5 text-xs rounded bg-secondary text-secondary-foreground">{s}</span>
              ))}
              <span className="text-xs text-muted-foreground">{guide.category}</span>
              <span className={`px-2 py-0.5 text-xs rounded ${getSeverityClasses(guide.severity)}`}>
                {guide.severity.charAt(0).toUpperCase() + guide.severity.slice(1)} Severity
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {(status === 'draft' || status === 'revision_required') && (
              <>
                <button onClick={() => onNavigate('admin-guide-edit', { guideId })}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors">
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleAction(() => apiPost<Guide>(`/guides/${guideId}/submit`, {}))}
                  disabled={acting}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50">
                  <Send className="w-4 h-4" />
                  {acting ? 'Submitting…' : 'Submit for Review'}
                </button>
              </>
            )}
            {status === 'reviewed' && (
              <button onClick={() => onNavigate('admin-guide-approve', { guideId })}
                className="flex items-center gap-1.5 px-3 py-2 text-sm bg-success text-success-foreground rounded-md hover:bg-success/90 transition-colors">
                <CheckCircle className="w-4 h-4" />
                Approve & Publish
              </button>
            )}
            {status === 'published' && (
              <button
                onClick={() => handleAction(() => apiPost<Guide>(`/guides/${guideId}/archive`, {}))}
                disabled={acting}
                className="flex items-center gap-1.5 px-3 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors text-muted-foreground disabled:opacity-50">
                <Archive className="w-4 h-4" />
                {acting ? '…' : 'Archive'}
              </button>
            )}
            {status === 'pending_review' && (
              <div className="flex items-center gap-2 px-3 py-2 bg-warning/10 text-warning text-sm rounded-md">
                <Clock className="w-4 h-4" />
                Awaiting Review
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-5">

            {status === 'revision_required' && guide.reviewComments && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-destructive mb-1">Revision Required</p>
                    <p className="text-sm text-destructive/80">{guide.reviewComments}</p>
                    {guide.reviewedBy && (
                      <p className="text-xs text-destructive/60 mt-1">— {guide.reviewedBy}, {formatDate(guide.reviewedAt)}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {status === 'reviewed' && guide.reviewComments && (
              <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-success mb-1">Approved by Vet Professional</p>
                    <p className="text-sm text-success/80">{guide.reviewComments}</p>
                    {guide.reviewedBy && (
                      <p className="text-xs text-success/60 mt-1">— {guide.reviewedBy}, {formatDate(guide.reviewedAt)}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <section className="bg-white rounded-lg border border-border p-5">
              <h3 className="mb-2">Emergency Scenario</h3>
              <p className="text-sm text-muted-foreground">{guide.description}</p>
            </section>

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
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {guide.warnings.length > 0 && (
              <section className="bg-white rounded-lg border border-border p-5">
                <h3 className="mb-3">Warnings</h3>
                <ul className="space-y-2">
                  {guide.warnings.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{w}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <div className="space-y-4">
            <section className="bg-white rounded-lg border border-border p-5">
              <h3 className="mb-3">Workflow Details</h3>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Read Time</dt>
                  <dd className="font-medium">{guide.readTime}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Created By</dt>
                  <dd className="font-medium">{guide.createdBy ?? '—'}</dd>
                </div>
                {guide.submittedAt && (
                  <div>
                    <dt className="text-muted-foreground">Submitted for Review</dt>
                    <dd className="font-medium">{formatDate(guide.submittedAt)}</dd>
                  </div>
                )}
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
                {guide.publishedAt && (
                  <div>
                    <dt className="text-muted-foreground">Published On</dt>
                    <dd className="font-medium">{formatDate(guide.publishedAt)}</dd>
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

            <section className="bg-white rounded-lg border border-border p-5">
              <h3 className="mb-3">Linked Content</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Videos</p>
                  {guide.relatedVideos.length > 0
                    ? guide.relatedVideos.map((v) => <p key={v} className="font-medium">{v}</p>)
                    : <p className="text-muted-foreground italic">None linked</p>
                  }
                </div>
                <div className="pt-2">
                  <p className="text-muted-foreground mb-1">Related Guides</p>
                  {guide.relatedGuides.length > 0
                    ? guide.relatedGuides.map((g) => <p key={g} className="font-medium">{g}</p>)
                    : <p className="text-muted-foreground italic">None linked</p>
                  }
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
