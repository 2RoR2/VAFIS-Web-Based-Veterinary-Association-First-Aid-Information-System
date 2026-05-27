import { useMemo, useState } from 'react';
import { QuizCard } from '../components/cards/QuizCard';
import { CheckCircle, XCircle, RotateCcw, Filter, TrendingUp, Award } from 'lucide-react';
import { useApiData } from '../hooks/useApiData';
import { Quiz } from '../types/content';

interface QuizPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function QuizPage({ onNavigate }: QuizPageProps) {
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All Quizzes');
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const { data: quizzes, loading, error } = useApiData<Quiz[]>('/quizzes', []);

  const species = ['All', 'Dogs', 'Cats', 'Rabbits', 'Guinea Pigs', 'Hamsters', 'Birds', 'All Pets'];
  const quizCategories = useMemo(() => ['All Quizzes', ...new Set(quizzes.map((quiz) => quiz.category))], [quizzes]);

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSpecies = selectedSpecies === 'all' || quiz.species.toLowerCase() === selectedSpecies;
    const matchesCategory = selectedCategory === 'All Quizzes' || quiz.category === selectedCategory;
    return matchesSpecies && matchesCategory;
  });

  const activeQuiz = activeQuizId ? quizzes.find((q) => q.id === activeQuizId) : null;

  const handleStartQuiz = (quizId: string) => {
    setActiveQuizId(quizId);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswers([]);
    setUserAnswers([]);
  };

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer === null || !activeQuiz) return;

    const isCorrect = selectedAnswer === activeQuiz.questions[currentQuestion].correct;
    setAnswers([...answers, isCorrect]);
    setUserAnswers([...userAnswers, selectedAnswer]);
    if (isCorrect) setScore(score + 1);

    if (currentQuestion < activeQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  const handleRetake = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswers([]);
    setUserAnswers([]);
  };

  if (showResult && activeQuiz) {
    const percentage = Math.round((score / activeQuiz.questions.length) * 100);
    const passed = percentage >= activeQuiz.passingScore;

    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg border border-border p-8 text-center">
            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${passed ? 'bg-success/10' : 'bg-warning/10'}`}>
              {passed ? (
                <CheckCircle className="w-10 h-10 text-success" />
              ) : (
                <XCircle className="w-10 h-10 text-warning" />
              )}
            </div>
            <h2 className="mb-2">{passed ? 'Congratulations!' : 'Good Effort!'}</h2>
            <p className="text-muted-foreground mb-2">
              You scored {score} out of {activeQuiz.questions.length} ({percentage}%)
            </p>
            <p className="text-sm text-muted-foreground mb-6">Passing score: {activeQuiz.passingScore}%</p>
            <div className="space-y-3 mb-6">
              {activeQuiz.questions.map((q, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-left ${answers[idx] ? 'border-success bg-success/5' : 'border-destructive bg-destructive/5'}`}
                >
                  <div className="flex items-start gap-2">
                    {answers[idx] ? (
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm mb-1">{q.question}</p>
                      {!answers[idx] && (
                        <>
                          <p className="text-xs text-destructive mb-1">
                            Your answer: {q.options[userAnswers[idx]]}
                          </p>
                          <p className="text-xs text-success">Correct answer: {q.options[q.correct]}</p>
                        </>
                      )}
                      <p className="text-xs text-muted-foreground mt-1 italic">{q.explanation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRetake}
                className="px-6 py-2 border border-border rounded-md hover:bg-muted transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Retake Quiz
              </button>
              <button
                onClick={() => setActiveQuizId(null)}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Back to Quizzes
              </button>
              <button
                onClick={() => onNavigate('feedback', { contentType: 'Quiz', contentTitle: activeQuiz.title })}
                className="px-6 py-2 border border-border rounded-md hover:bg-muted transition-colors"
              >
                Give Feedback
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeQuiz) {
    const question = activeQuiz.questions[currentQuestion];

    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2>{activeQuiz.title}</h2>
                <p className="text-sm text-muted-foreground">{activeQuiz.species} - {activeQuiz.difficulty}</p>
              </div>
              <button
                onClick={() => setActiveQuizId(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                Exit Quiz
              </button>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Question {currentQuestion + 1} of {activeQuiz.questions.length}
              </span>
              <span>Score: {score}/{activeQuiz.questions.length}</span>
            </div>
            <div className="progress">
              <div className="progress-fill" style={{ ['--progress' as any]: `${((currentQuestion + 1) / activeQuiz.questions.length) * 100}%` }} />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-border p-6 mb-6">
            <h3 className="mb-6">{question.question}</h3>
            <div className="space-y-3">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={`w-full p-4 rounded-lg border text-left transition-all ${
                    selectedAnswer === idx
                      ? 'border-primary bg-secondary'
                      : 'border-border hover:border-primary hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedAnswer === idx ? 'border-primary bg-primary' : 'border-muted-foreground'
                      }`}
                    >
                      {selectedAnswer === idx && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleNext}
              disabled={selectedAnswer === null}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentQuestion < activeQuiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2">Pet First-Aid Quizzes</h1>
          <p className="text-muted-foreground">
            Test your knowledge and reinforce your learning with interactive quizzes.
          </p>
        </div>
        {error && (
          <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Unable to load quizzes. {error}
          </div>
        )}
        {loading && !error && (
          <p className="mb-4 text-sm text-muted-foreground">Loading quizzes...</p>
        )}

        <div className="bg-white rounded-lg border border-border p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 flex-1">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <select
                value={selectedSpecies}
                onChange={(e) => setSelectedSpecies(e.target.value)}
                className="flex-1 px-4 py-2 border border-input rounded-md bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {species.map((s) => (
                  <option key={s} value={s.toLowerCase()}>
                    Species: {s}
                  </option>
                ))}
              </select>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 px-4 py-2 border border-input rounded-md bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {quizCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filteredQuizzes.length} of {quizzes.length} quizzes
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              title={quiz.title}
              questions={quiz.questions.length}
              species={quiz.species}
              onClick={() => handleStartQuiz(quiz.id)}
            />
          ))}
        </div>

        {filteredQuizzes.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-border">
            <p className="text-muted-foreground mb-2">No quizzes found matching your filters</p>
            <button
              onClick={() => {
                setSelectedSpecies('all');
                setSelectedCategory('All Quizzes');
              }}
              className="text-primary hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
