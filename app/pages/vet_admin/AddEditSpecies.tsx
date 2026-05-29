import { ArrowLeft, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut } from '../../services/api';
import { Species } from '../../types/content';

interface AddEditSpeciesPageProps {
  onNavigate: (page: string, data?: any) => void;
  speciesId?: string;
}

const emptyForm = {
  name: '',
  icon: '',
  description: '',
  commonEmergencies: [] as string[],
};

export function AddEditSpeciesPage({ onNavigate, speciesId }: AddEditSpeciesPageProps) {
  const isEdit = Boolean(speciesId);

  const [form, setForm]           = useState(emptyForm);
  const [emergencyInput, setEmergencyInput] = useState('');
  const [loading, setLoading]     = useState(isEdit);
  const [fetchError, setFetchError] = useState('');
  const [saving, setSaving]       = useState(false);
  const [errors, setErrors]       = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isEdit || !speciesId) return;
    apiGet<Species>(`/species/${speciesId}`)
      .then((data) => {
        setForm({
          name:              data.name,
          icon:              data.icon,
          description:       data.description,
          commonEmergencies: data.commonEmergencies,
        });
      })
      .catch((err) => setFetchError(err.message ?? 'Failed to load species.'))
      .finally(() => setLoading(false));
  }, [speciesId, isEdit]);

  /* ── Field helpers ─────────────────────────────────────────────────────── */

  const setField = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const addEmergency = () => {
    const trimmed = emergencyInput.trim();
    if (!trimmed) return;
    if (form.commonEmergencies.includes(trimmed)) {
      setEmergencyInput('');
      return;
    }
    setForm((prev) => ({ ...prev, commonEmergencies: [...prev.commonEmergencies, trimmed] }));
    setEmergencyInput('');
  };

  const removeEmergency = (item: string) =>
    setForm((prev) => ({
      ...prev,
      commonEmergencies: prev.commonEmergencies.filter((e) => e !== item),
    }));

  /* ── Validation ────────────────────────────────────────────────────────── */

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())  e.name = 'Name is required.';
    if (!form.icon.trim())  e.icon = 'Icon is required.';
    return e;
  };

  /* ── Submit ────────────────────────────────────────────────────────────── */

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setSaving(true);
    try {
      const payload = {
        name:              form.name.trim(),
        icon:              form.icon.trim(),
        description:       form.description.trim(),
        commonEmergencies: form.commonEmergencies,
      };
      if (isEdit && speciesId) {
        await apiPut<Species>(`/species/${speciesId}`, payload);
      } else {
        await apiPost<Species>('/species', payload);
      }
      onNavigate('admin-species-list');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save species.');
    } finally {
      setSaving(false);
    }
  };

  /* ── Loading / error ───────────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground text-sm">
        Loading species...
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{fetchError}</p>
          <button
            onClick={() => onNavigate('admin-species-list')}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md"
          >
            Back to Species List
          </button>
        </div>
      </div>
    );
  }

  /* ── Form ──────────────────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back link */}
        <button
          onClick={() => onNavigate('admin-species-list')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Species List
        </button>

        {/* Page header */}
        <h1 className="mb-6">{isEdit ? 'Edit Species' : 'Add Species'}</h1>

        <div className="space-y-6">

          {/* Name */}
          <div className="bg-white rounded-lg border border-border p-6">
            <h3 className="mb-4">Basic Information</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="e.g. Dogs"
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary ${
                    errors.name ? 'border-destructive' : 'border-border'
                  }`}
                />
                {errors.name && (
                  <p className="text-xs text-destructive mt-1">{errors.name}</p>
                )}
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Icon <span className="text-destructive">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-2xl flex-shrink-0 select-none">
                    {form.icon || '🐾'}
                  </div>
                  <input
                    type="text"
                    value={form.icon}
                    onChange={(e) => setField('icon', e.target.value)}
                    placeholder="Paste an emoji, e.g. 🐶"
                    className={`flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary ${
                      errors.icon ? 'border-destructive' : 'border-border'
                    }`}
                  />
                </div>
                {errors.icon && (
                  <p className="text-xs text-destructive mt-1">{errors.icon}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Paste a single emoji to represent this species.
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  placeholder="Brief description of the species and its first-aid context…"
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
            </div>
          </div>

          {/* Common Emergencies */}
          <div className="bg-white rounded-lg border border-border p-6">
            <h3 className="mb-1">Common Emergencies</h3>
            <p className="text-xs text-muted-foreground mb-4">
              List typical emergency scenarios for this species. These appear as tags on the species card.
            </p>

            {/* Existing tags */}
            {form.commonEmergencies.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {form.commonEmergencies.map((item) => (
                  <span
                    key={item}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-secondary text-secondary-foreground"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => removeEmergency(item)}
                      className="hover:text-destructive transition-colors"
                      aria-label={`Remove ${item}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add new */}
            <div className="flex gap-2">
              <input
                type="text"
                value={emergencyInput}
                onChange={(e) => setEmergencyInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addEmergency(); } }}
                placeholder="e.g. Choking, Bleeding, Seizure"
                className="flex-1 px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={addEmergency}
                className="flex items-center gap-1.5 px-3 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Press Enter or click Add to insert an item.</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => onNavigate('admin-species-list')}
              disabled={saving}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Species'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
