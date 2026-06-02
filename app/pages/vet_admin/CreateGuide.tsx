import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../services/api';
import { Guide, Video } from '../../types/content';
import { SPECIES_OPTIONS, CATEGORY_OPTIONS } from './mockData';

interface CreateGuidePageProps {
  onNavigate: (page: string, data?: any) => void;
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

const emptyForm: GuideForm = {
  title: '', species: [], description: '', readTime: '',
  steps: [{ number: 1, title: '', description: '' }],
  severity: 'medium', category: '', relatedVideoId: '', warnings: [''],
};

// Guide creation form with fields for basic info, species toggles, step-by-step instructions, warnings, and an optional linked video.
export function CreateGuidePage({ onNavigate }: CreateGuidePageProps) {
  const [form, setForm] = useState<GuideForm>(emptyForm);
  const [videos, setVideos] = useState<Video[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiGet<Video[]>('/videos').then(setVideos).catch(() => {});
  }, []);

  // Updates a single top-level field in the guide form state by key.
  const updateField = <K extends keyof GuideForm>(key: K, value: GuideForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Toggles a species in the selected species list.
  const toggleSpecies = (s: string) =>
    setForm((prev) => ({
      ...prev,
      species: prev.species.includes(s) ? prev.species.filter((x) => x !== s) : [...prev.species, s],
    }));

  // Updates the title or description of a step at the given index.
  const updateStep = (index: number, field: 'title' | 'description', value: string) =>
    setForm((prev) => {
      const steps = [...prev.steps];
      steps[index] = { ...steps[index], [field]: value };
      return { ...prev, steps };
    });

  // Appends a new empty step with an auto-incremented step number.
  const addStep = () =>
    setForm((prev) => ({
      ...prev,
      steps: [...prev.steps, { number: prev.steps.length + 1, title: '', description: '' }],
    }));

  // Removes the step at the given index and renumbers the remaining steps sequentially.
  const removeStep = (index: number) =>
    setForm((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, number: i + 1 })),
    }));

  // Updates the warning text at the given index.
  const updateWarning = (index: number, value: string) =>
    setForm((prev) => {
      const warnings = [...prev.warnings];
      warnings[index] = value;
      return { ...prev, warnings };
    });

  // Appends a new empty warning entry to the list.
  const addWarning = () => setForm((prev) => ({ ...prev, warnings: [...prev.warnings, ''] }));
  // Removes the warning at the given index.
  const removeWarning = (index: number) =>
    setForm((prev) => ({ ...prev, warnings: prev.warnings.filter((_, i) => i !== index) }));

  const isValid = form.title.trim() !== '' && form.species.length > 0 && form.category !== '' && form.readTime.trim() !== '';

  // POSTs the guide as a draft; if submitForReview is true, also calls the submit endpoint to advance it to pending_review.
  const save = async (submitForReview: boolean) => {
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
        relatedGuides: [],
      };
      const guide = await apiPost<Guide>('/guides', payload);
      if (submitForReview) {
        await apiPost(`/guides/${guide.id}/submit`, {});
      }
      onNavigate('admin-guide-list');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save guide.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        <button onClick={() => onNavigate('admin-guide-list')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Guide List
        </button>

        <h1 className="mb-1">Create New Guide</h1>
        <p className="text-muted-foreground mb-8">Fill in the guide details below. You can save as draft or submit for Vet Professional review.</p>

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
          <button onClick={() => onNavigate('admin-guide-list')}
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
