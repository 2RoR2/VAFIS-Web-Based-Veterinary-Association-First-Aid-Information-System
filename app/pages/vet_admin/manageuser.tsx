import { Plus, Settings, UserCheck, UserX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiGet } from '../../services/api';
import { VetAccount } from '../../types/content';

interface ManageUserListPageProps {
  onNavigate: (page: string, data?: any) => void;
}

// Vet professional account list page showing status badges, registration date, and a link to the detail/manage page.
export function ManageUserListPage({ onNavigate }: ManageUserListPageProps) {
  const [vets, setVets]     = useState<VetAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    apiGet<VetAccount[]>('/admin/vets', controller.signal)
      .then((data) => { setVets(data); setError(null); })
      .catch((err) => { if (err.name !== 'AbortError') setError(err.message ?? 'Failed to load accounts.'); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  // Formats an ISO date string to a short human-readable date in Malaysian locale, or returns '—' for missing dates.
  const formatDate = (iso: string) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleDateString('en-MY', { year: 'numeric', month: 'short', day: 'numeric' }); }
    catch { return iso; }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="mb-1">Vet Professional Accounts</h1>
            <p className="text-muted-foreground">
              Manage registered veterinary professional accounts and their access status.
            </p>
          </div>
          <button
            onClick={() => onNavigate('admin-vet-add')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Vet Professional
          </button>
        </div>

        {/* States */}
        {loading && (
          <div className="text-center py-16 text-muted-foreground text-sm">Loading accounts...</div>
        )}
        {!loading && error && (
          <div className="text-center py-16 text-destructive text-sm">{error}</div>
        )}

        {/* List */}
        {!loading && !error && (
          vets.length === 0 ? (
            <div className="bg-white rounded-lg border border-border p-12 text-center">
              <p className="text-muted-foreground mb-3">No veterinary professional accounts registered yet.</p>
              <button
                onClick={() => onNavigate('admin-vet-add')}
                className="text-primary text-sm underline underline-offset-2"
              >
                Register the first vet professional
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {vets.map((vet) => (
                <div
                  key={vet.id}
                  className="bg-white rounded-lg border border-border p-4 flex items-center gap-4 hover:border-primary/40 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold text-secondary-foreground flex-shrink-0 select-none">
                    {vet.fullName.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="font-medium text-sm">{vet.fullName}</p>
                      {vet.isSuspended ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-destructive/10 text-destructive font-medium">
                          <UserX className="w-3 h-3" />
                          Suspended
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-success/10 text-success font-medium">
                          <UserCheck className="w-3 h-3" />
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{vet.email}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Registered {formatDate(vet.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => onNavigate('admin-vet-detail', { vetId: vet.id })}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md hover:bg-muted transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
