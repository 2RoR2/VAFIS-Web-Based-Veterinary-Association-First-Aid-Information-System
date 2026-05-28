import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut } from '../../services/api';
import { Guide, Video } from '../../types/content';
import { SPECIES_OPTIONS, CATEGORY_OPTIONS } from './mockData';

interface EditGuidePageProps {
  onNavigate: (page: string, data?: any) => void;
  guideId?: string;
}

interface StepForm {
  number: number;
  title: string;
  description: string;
}

interface GuideForm {
  title: string;
  species: string[];
  description: string;
  readTime: string;
  steps: StepForm[];
  severity: 'low' | 'medium' | 'high';
  category: string;
  relatedVideoId: string;
  warnings: string[];
}

export function EditGuidePage({ onNavigate, guideId }: EditGuidePageProps) {
  const [guide, setGuide] = useState<Guide | null>(null);
  const [form, setForm] = useState<GuideForm | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    if (!guideId) { setFetchError('No guide ID provided.'); setLoading(false); return; }
    Promise.all([
      apiGet<Guide>(`/guides/${guideId}`),
      apiGet<Video[]>('/videos'),
    ])
      .then(([g, vids]) => {
        setGuide(g);
        setVideos(vids);
        setForm({
          title: g.title,
          species: [...g.species],
          description: g.description,
          readTime: g.readTime,
          steps: g.steps.map((s) => ({ number: s.number, title: s.title, description: s.description })),
          severity: g.severity,
          category: g.category,
          relatedVideoId: g.relatedVideos?.[0] ?? '',
          warnings: g.warnings.length > 0 ? [...g.warnings] : [''],
        });
      })
      .catch((err) => setFetchError(err.message ?? 'Failed to load guide.'))
      .finally(() => setLoading(false));
  }, [guideId]);

  const updateField = <K extends keyof GuideForm>(key: K, value: GuideForm[K]) =>
    setForm((prev) => prev ? { ...prev, [key]: value } : prev);

  const toggleSpecies = (s: string) =>
    setForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        species: prev.species.includes(s) ? prev.species.filter((x) => x !== s) : [...prev.species, s],
      };
    });

  const updateStep = (index: number, field: 'title' | 'description', value: string) =>
    setForm((prev) => {
      if (!prev) return prev;
      const steps = [...prev.steps];
      steps[index] = { ...steps[index], [field]: value };
      return { ...prev, steps };
    });

  const addStep = () =>
    setForm((prev) => prev ? { ...prev, steps: [...prev.steps, { number: prev.steps.length + 1, title: '', description: '' }] } : prev);

  const removeStep = (index: number) =>
    setForm((prev) => prev ? {
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, number: i + 1 })),
    } : prev);

  const updateWarning = (index: number, value: string) =>
    setForm((prev) => {
      if (!prev) return prev;
      const warnings = [...prev.warnings];
      warnings[index] = value;
      return { ...prev, warnings };
    });

  const addWarning = () => setForm((prev) => prev ? { ...prev, warnings: [...prev.warnings, ''] } : prev);
  const removeWarning = (index: number) =>
    setForm((prev) => prev ? { ...prev, warnings: prev.warnings.filter((_, i) => i !== index) } : prev);

  const isValid = form ? form.title.trim() !== '' && form.species.length > 0 && form.category !== '' && form.readTime.trim() !== '' : false;

  const save = async (submitForReview: boolean) => {
    if (!form || !guideId) return;
    if (!isValid) { setError('Please fill in all required fields.'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: form.title.trim(),
        species: form.species,
        description: form.description.trim(),
        readTime: form.readTime.trim(),
        severity: form.severity,
        category: form.category,
        steps: form.steps.filter((s) => s.title.trim()),
        warnings: form.warnings.filter((w) => w.trim()),
        relatedVideos: form.relatedVideoId ? [form.relatedVideoId] : [],
        relatedGuides: guide?.relatedGuides ?? [],
      };
      await apiPut<Guide>(`/guides/${guideId}`, payload);
      if (submitForReview) {
        await apiPost(`/guides/${guideId}/submit`, {});
      }
      onNavigate('admin-guide-detail', { guideId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save guide.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground text-sm">Loading guide...</div>;

  if (fetchError || !guide || !form) {
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

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        <button onClick={() => onNavigate('admin-guide-detail', { guideId })}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Guide Detail
        </button>

        <h1 className="mb-1">Edit Guide</h1>
        <p className="text-muted-foreground mb-8">Editing: <span className="font-medium text-foreground">{guide.title}</span></p>

        {error && (
          <div className="mb-6 rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
        )}

        <div className="space-y-6">

          {/* Basic Info */}
          <section className="bg-white rounded-lg border border-border p-6">
            <h2 className="mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Guide Title <span className="text-destructive">*</span></label>
                <input type="text" value={form.title} onChange={(e) => updateField('title', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Species <span className="text-destructive">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {SPECIES_OPTIONS.map((s) => (
                    <button key={s} type="button" onClick={() => toggleSpecies(s)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                        form.species.includes(s) ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/50'
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category <span className="text-destructive">*</span></label>
                  <select value={form.category} onChange={(e) => updateField('category', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-white">
                    <option value="">Select category</option>
                    {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Severity Flag</label>
                  <select value={form.severity} onChange={(e) => updateField('severity', e.target.value as GuideForm['severity'])}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-white">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Read Time <span className="text-destructive">*</span></label>
                  <input type="text" value={form.readTime} onChange={(e) => updateField('readTime', e.target.value)}
                    placeholder="e.g. 5 min"
                    className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
            </div>
          </section>

          {/* Content */}
          <section className="bg-white rounded-lg border border-border p-6">
            <h2 className="mb-4">Guide Content</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1">Emergency Scenario</label>
                <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)}
                  rows={3} className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Step-by-Step Instructions</label>
                  <button type="button" onClick={addStep}
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Add Step
                  </button>
                </div>
                <div className="space-y-3">
                  {form.steps.map((step, index) => (
                    <div key={index} className="border border-border rounded-md p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">Step {step.number}</span>
                        {form.steps.length > 1 && (
                          <button type="button" onClick={() => removeStep(index)} className="p-1 hover:text-destructive transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <input type="text" value={step.title} onChange={(e) => updateStep(index, 'title', e.target.value)}
                        placeholder="Step title"
                        className="w-full px-3 py-2 text-sm border border-border rounded-md mb-2 focus:outline-none focus:ring-1 focus:ring-primary" />
                      <textarea value={step.description} onChange={(e) => updateStep(index, 'description', e.target.value)}
                        rows={2} className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Warnings</label>
                  <button type="button" onClick={addWarning}
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Add Warning
                  </button>
                </div>
                <div className="space-y-2">
                  {form.warnings.map((w, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input type="text" value={w} onChange={(e) => updateWarning(index, e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
                      {form.warnings.length > 1 && (
                        <button type="button" onClick={() => removeWarning(index)} className="p-2 hover:text-destructive transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Links */}
          <section className="bg-white rounded-lg border border-border p-6">
            <h2 className="mb-1">Link Related Content</h2>
            <p className="text-sm text-muted-foreground mb-4">Optionally link a video tutorial to this guide.</p>
            <div>
              <label className="block text-sm font-medium mb-1">Link Video</label>
              <select value={form.relatedVideoId} onChange={(e) => updateField('relatedVideoId', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-white">
                <option value="">No video linked</option>
                {videos.map((v) => <option key={v.id} value={v.id}>{v.title}</option>)}
              </select>
            </div>
          </section>

        </div>

        <div className="flex justify-end gap-3 mt-8 pb-8">
          <button onClick={() => onNavigate('admin-guide-detail', { guideId })}
            className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors">
            Cancel
          </button>
          <button onClick={() => save(false)} disabled={saving}
            className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors disabled:opacity-50">
            {saving ? 'Saving…' : 'Save as Draft'}
          </button>
          <button onClick={() => save(true)} disabled={!isValid || saving}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? 'Saving…' : 'Submit for Review'}
          </button>
        </div>

      </div>
    </div>
  );
}
