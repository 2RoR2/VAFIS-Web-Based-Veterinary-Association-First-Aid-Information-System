import { ArrowLeft, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiGet } from '../../services/api';
import { Quiz } from '../../types/content';

interface QuizPreviewPageProps {
  onNavigate: (page: string, data?: any) => void;
  quizId?: string;
}

// Admin quiz preview that simulates the pet owner quiz experience with live feedback and a results screen; quiz results are not saved.
export function QuizPreviewPage({ onNavigate, quizId }: QuizPreviewPageProps) {
  const [quiz, setQuiz]           = useState<Quiz | null>(null);
  const [loading, setLoading]     = useState(true);
  const [fetchError, setFetchErr] = useState('');

  // Quiz player state (mirrors QuizPage)
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer]   = useState<number | null>(null);
  const [feedbackShown, setFeedbackShown]     = useState(false);
  const [showResult, setShowResult]           = useState(false);
  const [score, setScore]                     = useState(0);
  const [answers, setAnswers]                 = useState<boolean[]>([]);
  const [userAnswers, setUserAnswers]         = useState<number[]>([]);

  useEffect(() => {
    if (!quizId) { setFetchErr('No quiz ID provided.'); setLoading(false); return; }
    apiGet<Quiz>(`/quizzes/${quizId}`)
      .then(setQuiz)
      .catch((err) => setFetchErr(err.message ?? 'Failed to load quiz.'))
      .finally(() => setLoading(false));
  }, [quizId]);

  // Records the selected answer and shows feedback by locking all options.
  const handleAnswer = (idx: number) => {
    if (feedbackShown) return;
    setSelectedAnswer(idx);
    setFeedbackShown(true);
  };

  // Advances to the next question or transitions to the results screen after recording the current answer.
  const handleNext = () => {
    if (selectedAnswer === null || !quiz) return;
    const isCorrect   = selectedAnswer === quiz.questions[currentQuestion].correct;
    const newAnswers  = [...answers, isCorrect];
    const newUserAns  = [...userAnswers, selectedAnswer];
    setAnswers(newAnswers);
    setUserAnswers(newUserAns);
    if (isCorrect) setScore((s) => s + 1);

    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion((n) => n + 1);
      setSelectedAnswer(null);
      setFeedbackShown(false);
    } else {
      setShowResult(true);
    }
  };

  // Resets all quiz progress state to restart the preview from the first question.
  const handleRetake = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setFeedbackShown(false);
    setShowResult(false);
    setScore(0);
    setAnswers([]);
    setUserAnswers([]);
  };

  // ── Loading / error ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground text-sm">
        Loading quiz...
      </div>
    );
  }

  if (fetchError || !quiz) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{fetchError || 'Quiz not found.'}</p>
          <button
            onClick={() => onNavigate('admin-quiz-list')}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md"
          >
            Back to Quiz List
          </button>
        </div>
      </div>
    );
  }

  if (quiz.questions.length === 0) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => onNavigate('admin-quiz-list')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quiz List
          </button>
          <div className="bg-white rounded-lg border border-border p-12 text-center">
            <p className="text-muted-foreground mb-2">This quiz has no questions yet.</p>
            <button
              onClick={() => onNavigate('admin-quiz-questions', { quizId })}
              className="text-primary text-sm underline underline-offset-2"
            >
              Go to Question Management
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin notice banner indicating preview mode with an exit link back to the quiz list.
  const PreviewBanner = () => (
    <div className="bg-warning/10 border border-warning/20 rounded-md px-4 py-2 mb-6 flex items-center justify-between">
      <p className="text-sm text-warning font-medium">
        Admin Preview — this is how pet owners will see the quiz.
        Results are not saved.
      </p>
      <button
        onClick={() => onNavigate('admin-quiz-list')}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors ml-4 flex-shrink-0"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Exit Preview
      </button>
    </div>
  );

  // ── Result screen ──────────────────────────────────────────────────────────

  if (showResult) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    const passed     = percentage >= quiz.passingScore;

    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <PreviewBanner />

          <div className="bg-white rounded-lg border border-border p-8 text-center">
            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${passed ? 'bg-success/10' : 'bg-warning/10'}`}>
              {passed
                ? <CheckCircle className="w-10 h-10 text-success" />
                : <XCircle    className="w-10 h-10 text-warning" />
              }
            </div>
            <h2 className="mb-2">{passed ? 'Congratulations!' : 'Good Effort!'}</h2>
            <p className="text-muted-foreground mb-2">
              You scored {score} out of {quiz.questions.length} ({percentage}%)
            </p>
            <p className="text-sm text-muted-foreground mb-6">Passing score: {quiz.passingScore}%</p>

            <div className="space-y-3 mb-6">
              {quiz.questions.map((q, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-left ${answers[idx] ? 'border-success bg-success/5' : 'border-destructive bg-destructive/5'}`}
                >
                  <div className="flex items-start gap-2">
                    {answers[idx]
                      ? <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      : <XCircle    className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    }
                    <div>
                      <p className="text-sm font-medium mb-1">{q.question}</p>
                      {!answers[idx] && (
                        <>
                          <p className="text-xs text-destructive mb-1">Your answer: {q.options[userAnswers[idx]]}</p>
                          <p className="text-xs text-success mb-1">Correct answer: {q.options[q.correct]}</p>
                        </>
                      )}
                      <p className="text-xs text-muted-foreground italic">{q.explanation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={handleRetake}
                className="px-6 py-2 border border-border rounded-md hover:bg-muted transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Retake Quiz
              </button>
              <button
                onClick={() => onNavigate('admin-quiz-list')}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Exit Preview
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Active question screen ─────────────────────────────────────────────────

  const question      = quiz.questions[currentQuestion];
  const correctIndex  = question.correct;
  const isLastQuestion = currentQuestion === quiz.questions.length - 1;

  // Returns the CSS class string for an answer option based on selection and feedback state.
  const getOptionStyle = (idx: number) => {
    if (!feedbackShown) {
      return selectedAnswer === idx
        ? 'border-primary bg-secondary'
        : 'border-border hover:border-primary hover:bg-muted';
    }
    if (idx === correctIndex) return 'border-success bg-success/10 cursor-default';
    if (idx === selectedAnswer && idx !== correctIndex) return 'border-destructive bg-destructive/10 cursor-default';
    return 'border-border opacity-60 cursor-default';
  };

  // Returns the CSS class string for the radio circle indicator based on selection and feedback state.
  const getCircleStyle = (idx: number) => {
    if (!feedbackShown) {
      return selectedAnswer === idx ? 'border-primary bg-primary' : 'border-muted-foreground';
    }
    if (idx === correctIndex) return 'border-success bg-success';
    if (idx === selectedAnswer && idx !== correctIndex) return 'border-destructive bg-destructive';
    return 'border-muted-foreground';
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <PreviewBanner />

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2>{quiz.title}</h2>
              <p className="text-sm text-muted-foreground">{quiz.species} · {quiz.difficulty}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
            <span>Score: {score}/{quiz.questions.length}</span>
          </div>
          <div className="progress">
            <div
              className="progress-fill"
              style={{ ['--progress' as any]: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border p-6 mb-4">
          <h3 className="mb-6">{question.question}</h3>
          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={feedbackShown}
                className={`w-full p-4 rounded-lg border text-left transition-all ${getOptionStyle(idx)}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${getCircleStyle(idx)}`}>
                    {feedbackShown && idx === correctIndex && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    {feedbackShown && idx === selectedAnswer && idx !== correctIndex && <XCircle className="w-3.5 h-3.5 text-white" />}
                    {!feedbackShown && selectedAnswer === idx && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <span className="text-sm">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {feedbackShown && (
            <div className={`mt-4 p-4 rounded-lg border ${selectedAnswer === correctIndex ? 'border-success bg-success/5' : 'border-destructive bg-destructive/5'}`}>
              <div className="flex items-start gap-2">
                {selectedAnswer === correctIndex
                  ? <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  : <XCircle    className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                }
                <div>
                  <p className={`text-sm font-medium mb-1 ${selectedAnswer === correctIndex ? 'text-success' : 'text-destructive'}`}>
                    {selectedAnswer === correctIndex
                      ? 'Correct!'
                      : `Incorrect — Correct answer: ${question.options[correctIndex]}`}
                  </p>
                  <p className="text-sm text-muted-foreground">{question.explanation}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleNext}
            disabled={!feedbackShown}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
          </button>
        </div>
      </div>
    </div>
  );
}
