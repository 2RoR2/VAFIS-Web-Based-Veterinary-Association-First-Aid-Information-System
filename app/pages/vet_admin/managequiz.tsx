import { Plus, Edit, HelpCircle, Eye, Calendar, Archive, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut } from '../../services/api';
import { Quiz } from '../../types/content';
import { SPECIES_OPTIONS, QUIZ_STATUS_LABELS, getQuizStatusClasses } from './mockData';

interface ManageQuizListPageProps {
  onNavigate: (page: string, data?: any) => void;
}

const DIFFICULTY_CLASSES: Record<string, string> = {
  Beginner:     'bg-success/15 text-success',
  Intermediate: 'bg-warning/20 text-warning',
  Advanced:     'bg-destructive/15 text-destructive',
};

export function ManageQuizListPage({ onNavigate }: ManageQuizListPageProps) {
  const [quizzes, setQuizzes]       = useState<Quiz[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [speciesFilter, setSpecies] = useState('all');
  const [statusFilter, setStatus]   = useState('all');

  // Schedule modal
  const [scheduleTarget, setScheduleTarget] = useState<Quiz | null>(null);
  const [scheduleDate, setScheduleDate]     = useState('');
  const [scheduling, setScheduling]         = useState(false);
  const [scheduleError, setScheduleError]   = useState('');

  // Per-row loading indicator
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    apiGet<Quiz[]>('/quizzes/admin', controller.signal)
      .then((data) => { setQuizzes(data); setError(null); })
      .catch((err) => { if (err.name !== 'AbortError') setError(err.message ?? 'Failed to load quizzes.'); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const filtered = quizzes.filter((q) => {
    const matchSpecies = speciesFilter === 'all' || q.species === speciesFilter;
    const matchStatus  = statusFilter  === 'all' || (q.status ?? 'draft') === statusFilter;
    return matchSpecies && matchStatus;
  });

  // ── Row actions ────────────────────────────────────────────────────────────

  const handlePublish = async (quiz: Quiz) => {
    setActionId(quiz.id);
    try {
      const updated = await apiPost<Quiz>(`/quizzes/${quiz.id}/publish`, {});
      setQuizzes((prev) => prev.map((q) => (q.id === quiz.id ? updated : q)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to publish quiz.');
    } finally {
      setActionId(null);
    }
  };

  const openScheduleModal = (quiz: Quiz) => {
    setScheduleTarget(quiz);
    setScheduleDate(quiz.scheduledAt ? quiz.scheduledAt.slice(0, 16) : '');
    setScheduleError('');
  };

  const handleScheduleConfirm = async () => {
    if (!scheduleTarget || !scheduleDate) { setScheduleError('Please select a date and time.'); return; }
    setScheduling(true);
    setScheduleError('');
    try {
      const updated = await apiPut<Quiz>(`/quizzes/${scheduleTarget.id}`, {
        status: 'scheduled',
        scheduledAt: new Date(scheduleDate).toISOString(),
      });
      setQuizzes((prev) => prev.map((q) => (q.id === scheduleTarget.id ? updated : q)));
      setScheduleTarget(null);
    } catch (err) {
      setScheduleError(err instanceof Error ? err.message : 'Failed to schedule quiz.');
    } finally {
      setScheduling(false);
    }
  };

  const handleArchive = async (quiz: Quiz) => {
    if (!confirm(`Archive "${quiz.title}"? It will no longer be visible to pet owners.`)) return;
    setActionId(quiz.id);
    try {
      const updated = await apiPost<Quiz>(`/quizzes/${quiz.id}/archive`, {});
      setQuizzes((prev) => prev.map((q) => (q.id === quiz.id ? updated : q)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to archive quiz.');
    } finally {
      setActionId(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="mb-1">Quiz Management</h1>
            <p className="text-muted-foreground">Create, schedule, and manage all first-aid quizzes.</p>
          </div>
          <button
            onClick={() => onNavigate('admin-quiz-create')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Quiz
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-border p-4 mb-5 flex items-center gap-3">
          <select
            value={speciesFilter}
            onChange={(e) => setSpecies(e.target.value)}
            className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-white"
          >
            <option value="all">All Species</option>
            {SPECIES_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-white"
          >
            <option value="all">All Statuses</option>
            {Object.entries(QUIZ_STATUS_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>

          <p className="text-sm text-muted-foreground ml-auto">
            {loading ? '…' : `${filtered.length} ${filtered.length === 1 ? 'quiz' : 'quizzes'} found`}
          </p>
        </div>

        {/* States */}
        {loading && (
          <div className="text-center py-16 text-muted-foreground text-sm">Loading quizzes...</div>
        )}
        {!loading && error && (
          <div className="text-center py-16 text-destructive text-sm">{error}</div>
        )}

        {/* Quiz list */}
        {!loading && !error && (
          filtered.length === 0 ? (
            <div className="bg-white rounded-lg border border-border p-12 text-center">
              <p className="text-muted-foreground">No quizzes match the selected filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((quiz) => {
                const status = quiz.status ?? 'draft';
                const busy   = actionId === quiz.id;

                return (
                  <div
                    key={quiz.id}
                    className="bg-white rounded-lg border border-border p-4 flex items-center gap-4 hover:border-primary/40 transition-colors"
                  >
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm mb-1 truncate">{quiz.title}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 text-xs rounded font-medium ${getQuizStatusClasses(status)}`}>
                          {QUIZ_STATUS_LABELS[status] ?? status}
                        </span>
                        <span className="px-2 py-0.5 text-xs rounded bg-secondary text-secondary-foreground">
                          {quiz.species}
                        </span>
                        <span className="text-xs text-muted-foreground">{quiz.category}</span>
                        <span className={`px-2 py-0.5 text-xs rounded font-medium ${DIFFICULTY_CLASSES[quiz.difficulty] ?? ''}`}>
                          {quiz.difficulty}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {quiz.questions.length} {quiz.questions.length === 1 ? 'question' : 'questions'}
                        </span>
                        <span className="text-xs text-muted-foreground">Pass: {quiz.passingScore}%</span>
                      </div>
                      {status === 'scheduled' && quiz.scheduledAt && (
                        <p className="text-xs text-warning mt-1">
                          Publishes: {new Date(quiz.scheduledAt).toLocaleString('en-MY', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0 flex-wrap justify-end">
                      {/* Edit — not for published/archived */}
                      {status !== 'published' && status !== 'archived' && (
                        <button
                          onClick={() => onNavigate('admin-quiz-edit', { quizId: quiz.id })}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md hover:bg-muted transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Edit
                        </button>
                      )}

                      {/* Questions — always */}
                      <button
                        onClick={() => onNavigate('admin-quiz-questions', { quizId: quiz.id })}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md hover:bg-muted transition-colors"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        Questions
                      </button>

                      {/* Preview — always */}
                      <button
                        onClick={() => onNavigate('admin-quiz-preview', { quizId: quiz.id })}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md hover:bg-muted transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                      </button>

                      {/* Draft: Publish + Schedule */}
                      {status === 'draft' && (
                        <>
                          <button
                            disabled={busy}
                            onClick={() => handlePublish(quiz)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-success/15 text-success hover:bg-success/25 transition-colors disabled:opacity-50"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            Publish
                          </button>
                          <button
                            onClick={() => openScheduleModal(quiz)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-warning/10 text-warning hover:bg-warning/20 transition-colors"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            Schedule
                          </button>
                        </>
                      )}

                      {/* Scheduled: Publish Now + Reschedule */}
                      {status === 'scheduled' && (
                        <>
                          <button
                            disabled={busy}
                            onClick={() => handlePublish(quiz)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-success/15 text-success hover:bg-success/25 transition-colors disabled:opacity-50"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            Publish Now
                          </button>
                          <button
                            onClick={() => openScheduleModal(quiz)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-warning/10 text-warning hover:bg-warning/20 transition-colors"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            Reschedule
                          </button>
                        </>
                      )}

                      {/* Published or Scheduled: Archive */}
                      {(status === 'published' || status === 'scheduled') && (
                        <button
                          disabled={busy}
                          onClick={() => handleArchive(quiz)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md hover:bg-muted text-muted-foreground transition-colors disabled:opacity-50"
                        >
                          <Archive className="w-3.5 h-3.5" />
                          Archive
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* Schedule modal */}
      {scheduleTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg border border-border p-6 w-full max-w-sm shadow-lg">
            <h3 className="mb-1">Schedule Publication</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Choose when{' '}
              <span className="font-medium text-foreground">"{scheduleTarget.title}"</span>{' '}
              should go live for pet owners.
            </p>

            <label className="block text-sm font-medium mb-1">Publish date &amp; time</label>
            <input
              type="datetime-local"
              value={scheduleDate}
              min={new Date().toISOString().slice(0, 16)}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary mb-3"
            />

            {scheduleError && (
              <p className="text-xs text-destructive mb-3">{scheduleError}</p>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setScheduleTarget(null)}
                className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={scheduling}
                onClick={handleScheduleConfirm}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {scheduling ? 'Saving…' : 'Confirm Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
