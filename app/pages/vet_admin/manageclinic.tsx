import { Plus, Edit, Trash2, AlertCircle, Clock } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { apiGet, apiDelete } from '../../services/api';
import { Clinic } from '../../types/content';

interface ManageClinicListPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function ManageClinicListPage({ onNavigate }: ManageClinicListPageProps) {
  const [clinics, setClinics]           = useState<Clinic[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [speciesFilter, setSpeciesFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Clinic | null>(null);
  const [deleting, setDeleting]         = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    apiGet<Clinic[]>('/clinics', controller.signal)
      .then((data) => { setClinics(data); setError(null); })
      .catch((err) => { if (err.name !== 'AbortError') setError(err.message ?? 'Failed to load clinics.'); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  /* ── Derived species filter options ────────────────────────────────────── */

  const speciesOptions = useMemo(() => {
    const all = clinics.flatMap((c) => c.species);
    return Array.from(new Set(all)).sort();
  }, [clinics]);

  /* ── Filtered list ─────────────────────────────────────────────────────── */

  const filtered = useMemo(() => {
    if (!speciesFilter) return clinics;
    return clinics.filter((c) => c.species.includes(speciesFilter));
  }, [clinics, speciesFilter]);

  /* ── Delete ────────────────────────────────────────────────────────────── */

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiDelete<{ message: string }>(`/clinics/${deleteTarget.id}`);
      setClinics((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete clinic.');
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
            <h1 className="mb-1">Clinic Management</h1>
            <p className="text-muted-foreground">
              Manage registered veterinary clinics, operating hours, and emergency indicators.
            </p>
          </div>
          <button
            onClick={() => onNavigate('manage-clinic-add')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Clinic
          </button>
        </div>

        {/* Filters */}
        {!loading && !error && clinics.length > 0 && (
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

            {speciesFilter && (
              <button
                onClick={() => setSpeciesFilter('')}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear filter
              </button>
            )}
          </div>
        )}

        {/* States */}
        {loading && (
          <div className="text-center py-16 text-muted-foreground text-sm">Loading clinics...</div>
        )}
        {!loading && error && (
          <div className="text-center py-16 text-destructive text-sm">{error}</div>
        )}

        {/* List */}
        {!loading && !error && (
          filtered.length === 0 ? (
            <div className="bg-white rounded-lg border border-border p-12 text-center">
              {clinics.length === 0 ? (
                <>
                  <p className="text-muted-foreground mb-3">No clinics registered yet.</p>
                  <button
                    onClick={() => onNavigate('manage-clinic-add')}
                    className="text-primary text-sm underline underline-offset-2"
                  >
                    Add the first clinic
                  </button>
                </>
              ) : (
                <p className="text-muted-foreground">No clinics match the selected species.</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((clinic) => (
                <div
                  key={clinic.id}
                  className="bg-white rounded-lg border border-border p-4 flex items-start gap-4 hover:border-primary/40 transition-colors"
                >
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-medium text-sm">{clinic.name}</p>
                      {clinic.isEmergency && (
                        <span className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-destructive/10 text-destructive font-medium">
                          <AlertCircle className="w-3 h-3" />
                          24h / Emergency
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mb-1">
                      {clinic.address}, {clinic.city}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                      <span>{clinic.phone}</span>
                      {clinic.hours && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {clinic.hours}
                        </span>
                      )}
                    </div>

                    {clinic.species.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {clinic.species.map((sp) => (
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
                      onClick={() => onNavigate('manage-clinic-edit', { clinicId: clinic.id })}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md hover:bg-muted transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(clinic)}
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
            <h3 className="mb-2">Delete Clinic</h3>
            <p className="text-sm text-muted-foreground mb-1">
              Are you sure you want to delete:
            </p>
            <p className="text-sm font-medium mb-3">{deleteTarget.name}</p>
            <p className="text-sm text-destructive mb-6">
              This will permanently remove the clinic and all its details from the directory.
              Pet owners will no longer be able to find this clinic.
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
