import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut } from '../../services/api';
import { Quiz } from '../../types/content';
import { SPECIES_OPTIONS, CATEGORY_OPTIONS } from './mockData';

interface CreateEditQuizPageProps {
  onNavigate: (page: string, data?: any) => void;
  quizId?: string;
}

interface QuizForm {
  title: string;
  species: string;
  category: string;
  difficulty: Quiz['difficulty'];
  passingScore: number;
  description: string;
}

const emptyForm: QuizForm = {
  title: '',
  species: '',
  category: '',
  difficulty: 'Beginner',
  passingScore: 70,
  description: '',
};

// Create/edit form for a quiz, covering title, species, category, difficulty, pass mark, and description.
export function CreateEditQuizPage({ onNavigate, quizId }: CreateEditQuizPageProps) {
  const isEdit = Boolean(quizId);

  const [form, setForm]           = useState<QuizForm>(emptyForm);
  const [loading, setLoading]     = useState(isEdit);
  const [fetchError, setFetchErr] = useState('');
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!isEdit || !quizId) return;
    apiGet<Quiz>(`/quizzes/${quizId}`)
      .then((q) => {
        setForm({
          title:        q.title,
          species:      q.species,
          category:     q.category,
          difficulty:   q.difficulty,
          passingScore: q.passingScore,
          description:  q.description,
        });
      })
      .catch((err) => setFetchErr(err.message ?? 'Failed to load quiz.'))
      .finally(() => setLoading(false));
  }, [isEdit, quizId]);

  // Updates a single field in the quiz form state by key.
  const update = <K extends keyof QuizForm>(key: K, value: QuizForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const isValid =
    form.title.trim() !== '' &&
    form.species !== '' &&
    form.category !== '' &&
    form.passingScore >= 1 &&
    form.passingScore <= 100;

  // Validates required fields and POSTs a new quiz or PUTs an update, then navigates back to the quiz list on success.
  const handleSave = async () => {
    if (!isValid) { setSaveError('Please fill in all required fields.'); return; }
    setSaving(true);
    setSaveError('');
    try {
      const payload = {
        title:        form.title.trim(),
        species:      form.species,
        category:     form.category,
        difficulty:   form.difficulty,
        passingScore: form.passingScore,
        description:  form.description.trim(),
      };
      if (isEdit && quizId) {
        await apiPut<Quiz>(`/quizzes/${quizId}`, payload);
      } else {
        await apiPost<Quiz>('/quizzes', payload);
      }
      onNavigate('admin-quiz-list');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save quiz.');
    } finally {
      setSaving(false);
    }
  };

  // ── Loading / error states ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground text-sm">
        Loading quiz...
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{fetchError}</p>
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

  // ── Form ──────────────────────────────────────────────────────────────────

  const inputCls  = 'w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary';
  const selectCls = `${inputCls} bg-white`;

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

        <h1 className="mb-1">{isEdit ? 'Edit Quiz' : 'Create New Quiz'}</h1>
        <p className="text-muted-foreground mb-8">
          {isEdit
            ? 'Update the quiz details below. Questions are managed separately.'
            : 'Set up the quiz details. You can add questions after saving.'}
        </p>

        {saveError && (
          <div className="mb-6 rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {saveError}
          </div>
        )}

        <div className="space-y-6">

          {/* Quiz details */}
          <section className="bg-white rounded-lg border border-border p-6">
            <h2 className="mb-4">Quiz Details</h2>
            <div className="space-y-4">

              <div>
                <label className="block text-sm font-medium mb-1">
                  Topic / Title <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  placeholder="e.g. Choking Emergency Quiz"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Species <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={form.species}
                    onChange={(e) => update('species', e.target.value)}
                    className={selectCls}
                  >
                    <option value="">Select species</option>
                    {SPECIES_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => update('category', e.target.value)}
                    className={selectCls}
                  >
                    <option value="">Select category</option>
                    {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Difficulty</label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => update('difficulty', e.target.value as Quiz['difficulty'])}
                    className={selectCls}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Pass Mark (%) <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={form.passingScore}
                    onChange={(e) => update('passingScore', Number(e.target.value))}
                    className={inputCls}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Pet owners need to score at least {form.passingScore}% to pass.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder="Briefly describe what this quiz covers..."
                  rows={3}
                  className={`${inputCls} resize-none`}
                />
              </div>

            </div>
          </section>

          {isEdit && (
            <div className="bg-secondary/50 border border-border rounded-lg p-4 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Note:</span>{' '}
                To add, edit, or remove questions, use the{' '}
                <button
                  onClick={() => onNavigate('admin-quiz-questions', { quizId })}
                  className="text-primary underline underline-offset-2"
                >
                  Question Management
                </button>{' '}
                page after saving.
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-8 pb-8">
          <button
            onClick={() => onNavigate('admin-quiz-list')}
            className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !isValid}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Quiz'}
          </button>
        </div>

      </div>
    </div>
  );
}
