import { Plus, Edit, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { apiGet, apiDelete } from '../../services/api';
import { EmergencyScenario } from '../../types/content';

interface ManageEmergencyListPageProps {
  onNavigate: (page: string, data?: any) => void;
}

const SEVERITY_LABELS: Record<string, string> = {
  low:    'Low',
  medium: 'Medium',
  high:   'High',
};

// Returns the Tailwind badge class string for a given severity level string.
const getSeverityClasses = (severity: string) => {
  switch (severity) {
    case 'high':   return 'bg-destructive/10 text-destructive';
    case 'medium': return 'bg-warning/10 text-warning';
    case 'low':    return 'bg-success/10 text-success';
    default:       return 'bg-muted text-muted-foreground';
  }
};

// Emergency scenario management list page with species and severity filters, add/edit/delete actions, and a deletion confirmation modal.
export function ManageEmergencyListPage({ onNavigate }: ManageEmergencyListPageProps) {
  const [scenarios, setScenarios]           = useState<EmergencyScenario[]>([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);
  const [speciesFilter, setSpeciesFilter]   = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [deleteTarget, setDeleteTarget]     = useState<EmergencyScenario | null>(null);
  const [deleting, setDeleting]             = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    apiGet<EmergencyScenario[]>('/scenarios', controller.signal)
      .then((data) => { setScenarios(data); setError(null); })
      .catch((err) => { if (err.name !== 'AbortError') setError(err.message ?? 'Failed to load scenarios.'); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  // Derives a sorted list of unique species values across all scenarios for the filter dropdown.
  const speciesOptions = useMemo(() => {
    const all = scenarios.flatMap((s) => s.species);
    return Array.from(new Set(all)).sort();
  }, [scenarios]);

  // Filters the scenario list by the selected species and severity values.
  const filtered = useMemo(() => {
    return scenarios.filter((s) => {
      if (speciesFilter && !s.species.includes(speciesFilter)) return false;
      if (severityFilter && s.severity !== severityFilter)      return false;
      return true;
    });
  }, [scenarios, speciesFilter, severityFilter]);

  // DELETEs the targeted scenario via the API and removes it from the local list on success.
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiDelete<{ message: string }>(`/scenarios/${deleteTarget.id}`);
      setScenarios((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete scenario.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="mb-1">Emergency Scenario Management</h1>
            <p className="text-muted-foreground">
              Manage emergency scenarios displayed in guides and the emergency response system.
            </p>
          </div>
          <button
            onClick={() => onNavigate('admin-scenario-add')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Scenario
          </button>
        </div>

        {/* Filters */}
        {!loading && !error && scenarios.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-5">
            <select
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value)}
              className="px-3 py-1.5 border border-border rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Species</option>
              {speciesOptions.map((sp) => (
                <option key={sp} value={sp}>{sp}</option>
              ))}
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-1.5 border border-border rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Severities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {(speciesFilter || severityFilter) && (
              <button
                onClick={() => { setSpeciesFilter(''); setSeverityFilter(''); }}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* States */}
        {loading && (
          <div className="text-center py-16 text-muted-foreground text-sm">Loading scenarios...</div>
        )}
        {!loading && error && (
          <div className="text-center py-16 text-destructive text-sm">{error}</div>
        )}

        {/* List */}
        {!loading && !error && (
          filtered.length === 0 ? (
            <div className="bg-white rounded-lg border border-border p-12 text-center">
              {scenarios.length === 0 ? (
                <>
                  <p className="text-muted-foreground mb-3">No scenarios added yet.</p>
                  <button
                    onClick={() => onNavigate('admin-scenario-add')}
                    className="text-primary text-sm underline underline-offset-2"
                  >
                    Add the first scenario
                  </button>
                </>
              ) : (
                <p className="text-muted-foreground">No scenarios match the selected filters.</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((scenario) => (
                <div
                  key={scenario.id}
                  className="bg-white rounded-lg border border-border p-4 flex items-start gap-4 hover:border-primary/40 transition-colors"
                >
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-medium text-sm">{scenario.name}</p>
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getSeverityClasses(scenario.severity)}`}>
                        {SEVERITY_LABELS[scenario.severity]}
                      </span>
                    </div>

                    {scenario.description && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                        {scenario.description}
                      </p>
                    )}

                    {scenario.species.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {scenario.species.map((sp) => (
                          <span
                            key={sp}
                            className="px-2 py-0.5 text-xs rounded bg-secondary text-secondary-foreground"
                          >
                            {sp}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => onNavigate('admin-scenario-edit', { scenarioId: scenario.id })}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md hover:bg-muted transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(scenario)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg border border-border p-6 w-full max-w-md shadow-lg">
            <h3 className="mb-2">Delete Scenario</h3>
            <p className="text-sm text-muted-foreground mb-1">
              Are you sure you want to delete:
            </p>
            <p className="text-sm font-medium mb-3">{deleteTarget.name}</p>
            <p className="text-sm text-destructive mb-6">
              This will remove the scenario from the system. Existing guides that reference
              this scenario will not be automatically updated.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
