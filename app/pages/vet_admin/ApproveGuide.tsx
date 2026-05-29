import { ArrowLeft, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../services/api';
import { Guide } from '../../types/content';
import { getSeverityClasses } from './mockData';

interface ApproveGuidePageProps {
  onNavigate: (page: string, data?: any) => void;
  guideId?: string;
}

const CHECKLIST = [
  'Guide title is clear and accurately describes the emergency.',
  'All steps are correct, safe, and follow current veterinary best practices.',
  'Severity level is appropriate for the described emergency.',
  'Species and category are correctly assigned.',
  'Warnings section covers all critical safety notes.',
  'Vet Professional review comments have been addressed (if any).',
];

export function ApproveGuidePage({ onNavigate, guideId }: ApproveGuidePageProps) {
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [checked, setChecked] = useState<boolean[]>(CHECKLIST.map(() => false));
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');
  const [published, setPublished] = useState(false);

  useEffect(() => {
    if (!guideId) { setFetchError('No guide ID provided.'); setLoading(false); return; }
    apiGet<Guide>(`/guides/${guideId}`)
      .then((g) => { setGuide(g); })
      .catch((err) => setFetchError(err.message ?? 'Failed to load guide.'))
      .finally(() => setLoading(false));
  }, [guideId]);

  const toggleCheck = (index: number) =>
    setChecked((prev) => prev.map((v, i) => (i === index ? !v : v)));

  const allChecked = checked.every(Boolean);

  const handlePublish = async () => {
    if (!allChecked || !guideId) return;
    setPublishing(true);
    setPublishError('');
    try {
      await apiPost<Guide>(`/guides/${guideId}/publish`, {});
      setPublished(true);
      setTimeout(() => onNavigate('admin-guide-list'), 1500);
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : 'Failed to publish guide.');
    } finally {
      setPublishing(false);
    }
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

  if (guide.status !== 'reviewed') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-10 h-10 text-warning mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">This guide is not in the reviewed state and cannot be published.</p>
          <button onClick={() => onNavigate('admin-guide-detail', { guideId })}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md">
            Back to Guide Detail
          </button>
        </div>
      </div>
    );
  }

  if (published) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
          <p className="text-lg font-medium mb-1">Guide Published Successfully</p>
          <p className="text-muted-foreground text-sm">The guide is now live for pet owners.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        <button onClick={() => onNavigate('admin-guide-detail', { guideId })}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Guide Detail
        </button>

        <h1 className="mb-1">Approve & Publish Guide</h1>
        <p className="text-muted-foreground mb-8">
          Review the approval details below and confirm all checklist items before publishing.
        </p>

        {publishError && (
          <div className="mb-6 rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{publishError}</div>
        )}

        <div className="space-y-6">

          <section className="bg-white rounded-lg border border-border p-6">
            <h2 className="mb-4">Guide Summary</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div><dt className="text-muted-foreground">Title</dt><dd className="font-medium">{guide.title}</dd></div>
              <div><dt className="text-muted-foreground">Category</dt><dd className="font-medium">{guide.category}</dd></div>
              <div><dt className="text-muted-foreground">Species</dt><dd className="font-medium">{guide.species.join(', ')}</dd></div>
              <div>
                <dt className="text-muted-foreground">Severity</dt>
                <dd><span className={`px-2 py-0.5 text-xs rounded font-medium ${getSeverityClasses(guide.severity)}`}>
                  {guide.severity.charAt(0).toUpperCase() + guide.severity.slice(1)}
                </span></dd>
              </div>
              <div><dt className="text-muted-foreground">Total Steps</dt><dd className="font-medium">{guide.steps.length} steps</dd></div>
              <div><dt className="text-muted-foreground">Read Time</dt><dd className="font-medium">{guide.readTime}</dd></div>
            </dl>
          </section>

          <section className="bg-white rounded-lg border border-border p-6">
            <h2 className="mb-4">Vet Professional Review</h2>
            <div className="space-y-3 text-sm">
              <div className="flex gap-6">
                <div>
                  <p className="text-muted-foreground">Reviewed By</p>
                  <p className="font-medium">{guide.reviewedBy || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Reviewed On</p>
                  <p className="font-medium">{guide.reviewedAt ? new Date(guide.reviewedAt).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</p>
                </div>
              </div>
              {guide.reviewComments && (
                <div className="bg-success/10 border border-success/20 rounded-md p-4 mt-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-success mb-1">Reviewer Comments</p>
                      <p className="text-sm text-success/80">{guide.reviewComments}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="bg-white rounded-lg border border-border p-6">
            <h2 className="mb-1">Publication Checklist</h2>
            <p className="text-sm text-muted-foreground mb-4">
              You must confirm all items before the Publish button becomes active.
            </p>
            <div className="space-y-3">
              {CHECKLIST.map((item, index) => (
                <label key={index} className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" checked={checked[index]} onChange={() => toggleCheck(index)}
                    className="mt-0.5 w-4 h-4 accent-primary flex-shrink-0" />
                  <span className={`text-sm transition-colors ${checked[index] ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {item}
                  </span>
                </label>
              ))}
            </div>
            {!allChecked && (
              <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                <AlertTriangle className="w-3.5 h-3.5" />
                {checked.filter(Boolean).length} of {CHECKLIST.length} items confirmed
              </div>
            )}
          </section>

        </div>

        <div className="flex justify-end gap-3 mt-8 pb-8">
          <button onClick={() => onNavigate('admin-guide-detail', { guideId })}
            className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors">
            Cancel
          </button>
          <button onClick={handlePublish} disabled={!allChecked || publishing}
            className="px-4 py-2 text-sm bg-success text-success-foreground rounded-md hover:bg-success/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <span className="flex items-center gap-2">
              {publishing ? <Clock className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {publishing ? 'Publishing…' : 'Publish Now'}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}
