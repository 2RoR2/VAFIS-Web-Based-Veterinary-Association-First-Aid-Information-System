import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut } from '../../services/api';
import { EmergencyScenario } from '../../types/content';

interface AddEditEmergencyPageProps {
  onNavigate: (page: string, data?: any) => void;
  scenarioId?: string;
}

// Common species — sourced from the seed data. Can be extended as new species are added.
const SPECIES_OPTIONS = ['Dogs', 'Cats', 'Rabbits', 'Birds', 'Guinea Pigs', 'Hamsters', 'Reptiles', 'Exotic Pets', 'Small Animals', 'All Pets'];

const emptyForm = {
  name:        '',
  species:     [] as string[],
  severity:    'medium' as 'low' | 'medium' | 'high',
  description: '',
};

// Add/edit form for an emergency scenario with name, severity selector, species toggles, and description.
export function AddEditEmergencyPage({ onNavigate, scenarioId }: AddEditEmergencyPageProps) {
  const isEdit = Boolean(scenarioId);

  const [form, setForm]         = useState(emptyForm);
  const [loading, setLoading]   = useState(isEdit);
  const [fetchError, setFetchError] = useState('');
  const [saving, setSaving]     = useState(false);
  const [errors, setErrors]     = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isEdit || !scenarioId) return;
    apiGet<EmergencyScenario>(`/scenarios/${scenarioId}`)
      .then((data) => {
        setForm({
          name:        data.name,
          species:     data.species,
          severity:    data.severity,
          description: data.description,
        });
      })
      .catch((err) => setFetchError(err.message ?? 'Failed to load scenario.'))
      .finally(() => setLoading(false));
  }, [scenarioId, isEdit]);

  // Toggles a species in the selected species list.
  const toggleSpecies = (sp: string) => {
    setForm((prev) => ({
      ...prev,
      species: prev.species.includes(sp)
        ? prev.species.filter((s) => s !== sp)
        : [...prev.species, sp],
    }));
  };

  // Returns a map of field-level validation errors; an empty object means the form is valid.
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())       e.name    = 'Name is required.';
    if (form.species.length === 0) e.species = 'Select at least one species.';
    return e;
  };

  // Validates the form, then POSTs a new scenario or PUTs an update, and navigates back to the scenario list on success.
  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setSaving(true);
    try {
      const payload = {
        name:        form.name.trim(),
        species:     form.species,
        severity:    form.severity,
        description: form.description.trim(),
      };
      if (isEdit && scenarioId) {
        await apiPut<EmergencyScenario>(`/scenarios/${scenarioId}`, payload);
      } else {
        await apiPost<EmergencyScenario>('/scenarios', payload);
      }
      onNavigate('admin-scenario-list');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save scenario.');
    } finally {
      setSaving(false);
    }
  };

  /* ── Loading / error ───────────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground text-sm">
        Loading scenario...
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{fetchError}</p>
          <button
            onClick={() => onNavigate('admin-scenario-list')}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md"
          >
            Back to Scenario List
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
          onClick={() => onNavigate('admin-scenario-list')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Scenario List
        </button>

        <h1 className="mb-6">{isEdit ? 'Edit Scenario' : 'Add Scenario'}</h1>

        <div className="space-y-6">

          {/* Basic info */}
          <div className="bg-white rounded-lg border border-border p-6">
            <h3 className="mb-4">Basic Information</h3>

            <div className="space-y-4">

              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Scenario Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Choking, Poisoning, Severe Bleeding"
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary ${
                    errors.name ? 'border-destructive' : 'border-border'
                  }`}
                />
                {errors.name && (
                  <p className="text-xs text-destructive mt-1">{errors.name}</p>
                )}
              </div>

              {/* Severity */}
              <div>
                <label className="block text-sm font-medium mb-2">Severity Level</label>
                <div className="flex gap-3">
                  {(['low', 'medium', 'high'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, severity: level }))}
                      className={`flex-1 py-2 text-sm rounded-md border transition-colors capitalize ${
                        form.severity === level
                          ? level === 'high'
                            ? 'bg-destructive/10 border-destructive text-destructive font-medium'
                            : level === 'medium'
                            ? 'bg-warning/10 border-warning text-warning font-medium'
                            : 'bg-success/10 border-success text-success font-medium'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the scenario and what it involves…"
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
            </div>
          </div>

          {/* Species */}
          <div className="bg-white rounded-lg border border-border p-6">
            <h3 className="mb-1">
              Applicable Species <span className="text-destructive">*</span>
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Select all species this scenario applies to.
            </p>
            <div className="flex flex-wrap gap-2">
              {SPECIES_OPTIONS.map((sp) => {
                const selected = form.species.includes(sp);
                return (
                  <button
                    key={sp}
                    type="button"
                    onClick={() => toggleSpecies(sp)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                      selected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border hover:border-primary hover:bg-muted'
                    }`}
                  >
                    {sp}
                  </button>
                );
              })}
            </div>
            {errors.species && (
              <p className="text-xs text-destructive mt-2">{errors.species}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => onNavigate('admin-scenario-list')}
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
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Scenario'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
