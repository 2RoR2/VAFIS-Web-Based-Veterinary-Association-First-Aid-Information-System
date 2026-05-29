import { ArrowLeft, Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiGet, apiPut } from '../../services/api';
import { Quiz, QuizQuestion } from '../../types/content';

interface QuizQuestionsPageProps {
  onNavigate: (page: string, data?: any) => void;
  quizId?: string;
}

interface QuestionForm {
  question: string;
  options: [string, string, string, string];
  correct: number;
  explanation: string;
}

const emptyQuestion: QuestionForm = {
  question:    '',
  options:     ['', '', '', ''],
  correct:     0,
  explanation: '',
};

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export function QuizQuestionsPage({ onNavigate, quizId }: QuizQuestionsPageProps) {
  const [quiz, setQuiz]               = useState<Quiz | null>(null);
  const [questions, setQuestions]     = useState<QuizQuestion[]>([]);
  const [loading, setLoading]         = useState(true);
  const [fetchError, setFetchError]   = useState('');

  // Add / Edit state
  const [editIndex, setEditIndex]     = useState<number | null>(null); // null = add mode
  const [showForm, setShowForm]       = useState(false);
  const [form, setForm]               = useState<QuestionForm>(emptyQuestion);

  // Delete confirmation
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  // Save state
  const [saving, setSaving]           = useState(false);
  const [saveError, setSaveError]     = useState('');
  const [saved, setSaved]             = useState(false);

  useEffect(() => {
    if (!quizId) { setFetchError('No quiz ID provided.'); setLoading(false); return; }
    apiGet<Quiz>(`/quizzes/${quizId}`)
      .then((q) => { setQuiz(q); setQuestions(q.questions ?? []); })
      .catch((err) => setFetchError(err.message ?? 'Failed to load quiz.'))
      .finally(() => setLoading(false));
  }, [quizId]);

  // ── Form helpers ───────────────────────────────────────────────────────────

  const openAddForm = () => {
    setForm(emptyQuestion);
    setEditIndex(null);
    setShowForm(true);
  };

  const openEditForm = (index: number) => {
    const q = questions[index];
    setForm({
      question:    q.question,
      options:     [q.options[0], q.options[1], q.options[2], q.options[3]] as [string, string, string, string],
      correct:     q.correct,
      explanation: q.explanation,
    });
    setEditIndex(index);
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditIndex(null); };

  const updateOption = (i: number, value: string) => {
    setForm((prev) => {
      const options = [...prev.options] as [string, string, string, string];
      options[i] = value;
      return { ...prev, options };
    });
  };

  const isFormValid =
    form.question.trim() !== '' &&
    form.options.every((o) => o.trim() !== '') &&
    form.explanation.trim() !== '';

  const handleFormSave = () => {
    if (!isFormValid) return;
    const entry: QuizQuestion = {
      question:    form.question.trim(),
      options:     form.options.map((o) => o.trim()),
      correct:     form.correct,
      explanation: form.explanation.trim(),
    };
    if (editIndex !== null) {
      setQuestions((prev) => prev.map((q, i) => (i === editIndex ? entry : q)));
    } else {
      setQuestions((prev) => [...prev, entry]);
    }
    closeForm();
    setSaved(false); // mark as unsaved
  };

  const handleDelete = () => {
    if (deleteIndex === null) return;
    setQuestions((prev) => prev.filter((_, i) => i !== deleteIndex));
    setDeleteIndex(null);
    setSaved(false);
  };

  // ── Save all to API ────────────────────────────────────────────────────────

  const handleSaveAll = async () => {
    if (!quizId) return;
    setSaving(true);
    setSaveError('');
    try {
      await apiPut<Quiz>(`/quizzes/${quizId}`, { questions });
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save questions.');
    } finally {
      setSaving(false);
    }
  };

  // ── States ────────────────────────────────────────────────────────────────

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

  // ── Render ─────────────────────────────────────────────────────────────────

  const inputCls = 'w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary';

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back */}
        <button
          onClick={() => onNavigate('admin-quiz-list')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Quiz List
        </button>

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="mb-1">Question Management</h1>
            <p className="text-muted-foreground text-sm">
              Quiz: <span className="font-medium text-foreground">{quiz.title}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {questions.length} {questions.length === 1 ? 'question' : 'questions'} · Pass mark: {quiz.passingScore}%
            </p>
          </div>
          <button
            onClick={openAddForm}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </button>
        </div>

        {/* Save status */}
        {saveError && (
          <div className="mb-4 rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {saveError}
          </div>
        )}
        {saved && (
          <div className="mb-4 rounded-md border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
            Questions saved successfully.
          </div>
        )}

        {/* Question list */}
        {questions.length === 0 ? (
          <div className="bg-white rounded-lg border border-border p-12 text-center mb-6">
            <p className="text-muted-foreground mb-2">No questions yet.</p>
            <button
              onClick={openAddForm}
              className="text-primary text-sm underline underline-offset-2"
            >
              Add the first question
            </button>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {questions.map((q, index) => (
              <div key={index} className="bg-white rounded-lg border border-border p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                      {index + 1}
                    </span>
                    <p className="text-sm font-medium">{q.question}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEditForm(index)}
                      className="p-1.5 hover:bg-muted rounded-md transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteIndex(index)}
                      className="p-1.5 hover:bg-destructive/10 text-destructive rounded-md transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Options */}
                <div className="grid grid-cols-2 gap-2 mb-3 pl-8">
                  {q.options.map((opt, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs ${
                        i === q.correct
                          ? 'bg-success/15 text-success font-medium'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <span className="font-medium">{OPTION_LABELS[i]}.</span>
                      <span>{opt}</span>
                      {i === q.correct && <Check className="w-3 h-3 ml-auto flex-shrink-0" />}
                    </div>
                  ))}
                </div>

                {/* Explanation */}
                <p className="text-xs text-muted-foreground pl-8 italic">
                  <span className="font-medium not-italic text-foreground">Explanation: </span>
                  {q.explanation}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Save All button */}
        {questions.length > 0 && (
          <div className="flex justify-end pb-8">
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}

      </div>

      {/* Add / Edit question form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-lg border border-border p-6 w-full max-w-lg shadow-lg my-auto">
            <div className="flex items-center justify-between mb-4">
              <h3>{editIndex !== null ? `Edit Question ${editIndex + 1}` : 'Add New Question'}</h3>
              <button onClick={closeForm} className="p-1 hover:bg-muted rounded-md transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Question prompt */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Question Prompt <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={form.question}
                  onChange={(e) => setForm((prev) => ({ ...prev, question: e.target.value }))}
                  placeholder="e.g. What is the first step when a dog is choking?"
                  rows={2}
                  className={`${inputCls} resize-none`}
                />
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Answer Options <span className="text-destructive">*</span>
                </label>
                <div className="space-y-2">
                  {form.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, correct: i }))}
                        className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-medium transition-colors ${
                          form.correct === i
                            ? 'border-success bg-success text-success-foreground'
                            : 'border-border hover:border-primary'
                        }`}
                        title={`Set option ${OPTION_LABELS[i]} as correct`}
                      >
                        {OPTION_LABELS[i]}
                      </button>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => updateOption(i, e.target.value)}
                        placeholder={`Option ${OPTION_LABELS[i]}`}
                        className={inputCls}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Click a letter to mark it as the correct answer (currently:{' '}
                  <span className="text-success font-medium">{OPTION_LABELS[form.correct]}</span>).
                </p>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Explanatory Note <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={form.explanation}
                  onChange={(e) => setForm((prev) => ({ ...prev, explanation: e.target.value }))}
                  placeholder="Explain why the correct answer is right..."
                  rows={2}
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeForm}
                className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFormSave}
                disabled={!isFormValid}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editIndex !== null ? 'Update Question' : 'Add Question'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteIndex !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg border border-border p-6 w-full max-w-sm shadow-lg">
            <h3 className="mb-2">Delete Question</h3>
            <p className="text-sm text-muted-foreground mb-1">
              Are you sure you want to delete question {deleteIndex + 1}?
            </p>
            <p className="text-sm font-medium mb-4">"{questions[deleteIndex]?.question}"</p>
            <p className="text-sm text-destructive mb-6">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteIndex(null)}
                className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
