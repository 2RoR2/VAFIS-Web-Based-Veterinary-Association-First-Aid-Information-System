import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { AuthUser } from '../AuthPage';
import { apiGet } from '../../services/api';
import { QuizQuestion, QuizResultItem } from '../../types/content';

interface StoreQuizPageProps {
  onNavigate: (page: string, data?: any) => void;
  currentUser: AuthUser | null;
}

// Formats an ISO/raw date string to a human-readable date-time in Malaysian locale, or returns '—' for empty input.
const formatDate = (raw: string) => {
  if (!raw) return '—';
  try {
    return new Date(raw).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return raw;
  }
};

// Inline badge showing pass/fail status and percentage for a quiz result.
const ScoreBadge = ({ percentage, passed }: { percentage: number; passed: boolean }) => (
  <span
    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
      passed
        ? 'bg-success/10 text-success'
        : 'bg-destructive/10 text-destructive'
    }`}
  >
    {passed ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
    {passed ? 'Passed' : 'Failed'} · {percentage}%
  </span>
);

// Renders a per-question breakdown for a completed quiz, showing correct/incorrect status, the user's answer, and an explanation.
function QuestionReview({
  questions,
  userAnswers,
}: {
  questions: QuizQuestion[];
  userAnswers: number[];
}) {
  return (
    <div className="mt-4 space-y-3 border-t border-border pt-4">
      {questions.map((q, idx) => {
        const selected = userAnswers[idx];
        const correct  = q.correct;
        const isRight  = selected === correct;

        return (
          <div
            key={idx}
            className={`rounded-lg border p-4 ${
              isRight
                ? 'border-success/30 bg-success/5'
                : 'border-destructive/30 bg-destructive/5'
            }`}
          >
            {/* Question */}
            <div className="flex items-start gap-2 mb-2">
              {isRight ? (
                <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              )}
              <p className="text-sm font-medium">
                <span className="text-muted-foreground mr-1">Q{idx + 1}.</span>
                {q.question}
              </p>
            </div>

            {/* Answer lines */}
            <div className="ml-6 space-y-1 text-xs">
              {!isRight && (
                <p className="text-destructive">
                  Your answer:{' '}
                  <span className="font-medium">
                    {selected !== undefined ? q.options[selected] : '—'}
                  </span>
                </p>
              )}
              <p className={isRight ? 'text-success' : 'text-muted-foreground'}>
                {isRight ? 'Correct answer: ' : 'Correct answer: '}
                <span className="font-medium">{q.options[correct]}</span>
              </p>
              {q.explanation && (
                <p className="text-muted-foreground italic mt-1">{q.explanation}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Collapsible card displaying a single quiz result with score badge, attempt date, and an expandable per-question review.
function ResultCard({
  result,
  onRetake,
}: {
  result: QuizResultItem;
  onRetake: (quizId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const hasBreakdown =
    Array.isArray(result.userAnswers) &&
    result.userAnswers.length > 0 &&
    Array.isArray(result.questions) &&
    result.questions.length > 0;

  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden hover:border-primary/30 transition-colors">
      {/* Card header — always visible */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm mb-1 truncate">
              {result.quizTitle ?? 'Untitled Quiz'}
            </p>
            <p className="text-xs text-muted-foreground">{formatDate(result.attemptDate)}</p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
            <ScoreBadge percentage={result.percentage} passed={result.passed} />
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {result.score} / {result.totalQuestions}
            </span>
          </div>
        </div>

        {/* Action row */}
        <div className="flex items-center gap-3 mt-3">
          {hasBreakdown && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  Hide review
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  Review answers
                </>
              )}
            </button>
          )}
          {!hasBreakdown && result.userAnswers === null && result.questions !== null && (
            <p className="text-xs text-muted-foreground italic">
              No per-question data (recorded before this feature was added).
            </p>
          )}
          {result.questions === null && (
            <p className="text-xs text-muted-foreground italic">Quiz has been removed.</p>
          )}
          <button
            onClick={() => onRetake(result.quizId)}
            className="ml-auto text-xs px-3 py-1 border border-border rounded-md hover:bg-muted transition-colors"
          >
            Retake
          </button>
        </div>
      </div>

      {/* Expandable breakdown */}
      {expanded && hasBreakdown && (
        <div className="px-4 sm:px-5 pb-5">
          <QuestionReview
            questions={result.questions!}
            userAnswers={result.userAnswers!}
          />
        </div>
      )}
    </div>
  );
}

// Quiz history page showing the user's past attempts with summary stats, pass/fail filter tabs, and expandable result cards.
export function StoreQuizPage({ onNavigate, currentUser }: StoreQuizPageProps) {
  const [results, setResults]     = useState<QuizResultItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [filter, setFilter]       = useState<FilterType>('all');

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    apiGet<QuizResultItem[]>('/quizzes/my-results', controller.signal)
      .then((data) => { setResults(data); setError(null); })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message ?? 'Failed to load quiz history.');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [currentUser]);

  const filtered = results.filter((r) => {
    if (filter === 'passed') return r.passed;
    if (filter === 'failed') return !r.passed;
    return true;
  });

  // Summary stats
  const total     = results.length;
  const passCount = results.filter((r) => r.passed).length;
  const failCount = total - passCount;
  const passRate  = total > 0 ? Math.round((passCount / total) * 100) : 0;
  const bestScore = total > 0 ? Math.max(...results.map((r) => r.percentage)) : null;

  // Navigates to the quiz list page so the user can find and retake the quiz.
  const handleRetake = (quizId: string) => {
    onNavigate('quiz');
    // QuizPage opens with the full list; user can find and retake from there.
    // A direct "start quiz" by ID would require extra QuizPage work — kept simple for now.
  };

  // ── Not logged in ──────────────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24">
          <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="mb-2">Sign in to view your quiz history</h2>
          <p className="text-muted-foreground mb-6">
            Your quiz results are saved when you are logged in.
          </p>
          <button
            onClick={() => onNavigate('login')}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Log in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="mb-1">My Quiz History</h1>
          <p className="text-muted-foreground">
            Review your past quiz attempts and study the questions you got wrong.
          </p>
        </div>

        {/* Summary cards */}
        {!loading && !error && total > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total Attempts', value: total,                 cls: 'text-foreground' },
              { label: 'Passed',         value: passCount,             cls: 'text-success'    },
              { label: 'Failed',         value: failCount,             cls: 'text-destructive' },
              { label: 'Pass Rate',      value: `${passRate}%`,        cls: 'text-primary'    },
            ].map(({ label, value, cls }) => (
              <div key={label} className="bg-white rounded-lg border border-border p-4 text-center">
                <p className={`text-xl font-semibold mb-0.5 ${cls}`}>{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Best score note */}
        {bestScore !== null && (
          <div className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="w-4 h-4 flex-shrink-0" />
            Your best score across all attempts: <span className="font-medium text-foreground">{bestScore}%</span>
          </div>
        )}

        {/* Filter tabs */}
        {!loading && !error && total > 0 && (
          <div className="flex gap-2 mb-5">
            {(['all', 'passed', 'failed'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm transition-colors capitalize ${
                  filter === f
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white border border-border hover:bg-muted'
                }`}
              >
                {f === 'all'    ? `All (${total})`      : ''}
                {f === 'passed' ? `Passed (${passCount})` : ''}
                {f === 'failed' ? `Failed (${failCount})` : ''}
              </button>
            ))}
          </div>
        )}

        {/* States */}
        {loading && (
          <div className="text-center py-16 text-sm text-muted-foreground">
            Loading quiz history…
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && total === 0 && (
          <div className="bg-white rounded-lg border border-border p-12 text-center">
            <ClipboardList className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium mb-1">No quiz attempts yet</p>
            <p className="text-sm text-muted-foreground mb-5">
              Complete a quiz to see your results here.
            </p>
            <button
              onClick={() => onNavigate('quiz')}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Browse Quizzes
            </button>
          </div>
        )}

        {/* Filter empty state */}
        {!loading && !error && total > 0 && filtered.length === 0 && (
          <div className="bg-white rounded-lg border border-border p-8 text-center">
            <p className="text-muted-foreground">No {filter} attempts found.</p>
          </div>
        )}

        {/* Results list */}
        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((result) => (
              <ResultCard key={result.id} result={result} onRetake={handleRetake} />
            ))}
          </div>
        )}

        {/* Note if capped at 50 */}
        {!loading && !error && total >= 50 && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Showing your most recent 50 attempts.
          </p>
        )}

        {/* Back link */}
        {!loading && (
          <div className="mt-8 flex justify-start">
            <button
              onClick={() => onNavigate('pet-dashboard')}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
