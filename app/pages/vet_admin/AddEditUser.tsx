import { ArrowLeft, UserCheck, UserX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut } from '../../services/api';
import { VetAccount } from '../../types/content';

interface AddEditUserPageProps {
  onNavigate: (page: string, data?: any) => void;
  vetId?: string;            // present → manage/detail mode; absent → add mode
}

// Registration form for creating a new veterinary professional account with name, email, and initial password.
function AddVetForm({ onNavigate }: { onNavigate: AddEditUserPageProps['onNavigate'] }) {
  const [form, setForm]   = useState({ fullName: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Returns a map of field-level validation errors; an empty object means the form is valid.
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required.';
    if (!form.email.trim())    e.email    = 'Email address is required.';
    if (!form.password)        e.password = 'Password is required.';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters.';
    return e;
  };

  // Validates the form and POSTs the new vet account to the API, then navigates back to the account list on success.
  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setSaving(true);
    try {
      await apiPost<VetAccount>('/admin/vets', {
        fullName: form.fullName.trim(),
        email:    form.email.trim(),
        password: form.password,
      });
      onNavigate('admin-vet-list');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to register account.');
    } finally {
      setSaving(false);
    }
  };

  // Returns the input CSS class string, applying a destructive border when the field has an error.
  const inputClass = (hasError?: boolean) =>
    `w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary ${
      hasError ? 'border-destructive' : 'border-border'
    }`;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">

        <button
          onClick={() => onNavigate('admin-vet-list')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Accounts
        </button>

        <h1 className="mb-6">Register Vet Professional</h1>

        <div className="bg-white rounded-lg border border-border p-6 space-y-4">

          <div>
            <label className="block text-sm font-medium mb-1">
              Full Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
              placeholder="Dr. Jane Smith"
              className={inputClass(!!errors.fullName)}
            />
            {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Email Address <span className="text-destructive">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="vet@example.my"
              className={inputClass(!!errors.email)}
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Initial Password <span className="text-destructive">*</span>
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              placeholder="Minimum 6 characters"
              className={inputClass(!!errors.password)}
            />
            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
            <p className="text-xs text-muted-foreground mt-1">
              Share this password securely with the vet professional. They can change it after logging in.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => onNavigate('admin-vet-list')}
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
              {saving ? 'Registering…' : 'Register Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Read-only detail view for an existing vet professional account, with a suspend/reactivate action and confirmation modal.
function ManageVetDetail({ vetId, onNavigate }: { vetId: string; onNavigate: AddEditUserPageProps['onNavigate'] }) {
  const [vet, setVet]           = useState<VetAccount | null>(null);
  const [loading, setLoading]   = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [confirmAction, setConfirmAction] = useState<'suspend' | 'reactivate' | null>(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    apiGet<VetAccount>(`/admin/vets/${vetId}`)
      .then(setVet)
      .catch((err) => setFetchError(err.message ?? 'Failed to load account.'))
      .finally(() => setLoading(false));
  }, [vetId]);

  // PUTs to the suspend endpoint to toggle the vet account between suspended and active, then updates local state.
  const handleToggleSuspend = async () => {
    if (!vet) return;
    setToggling(true);
    try {
      const updated = await apiPut<VetAccount>(`/admin/vets/${vetId}/suspend`, {});
      setVet(updated);
      setConfirmAction(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update account status.');
    } finally {
      setToggling(false);
    }
  };

  // Formats an ISO date string to a human-readable date in Malaysian locale, or returns '—' for missing dates.
  const formatDate = (iso: string) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleDateString('en-MY', { year: 'numeric', month: 'long', day: 'numeric' }); }
    catch { return iso; }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground text-sm">
        Loading account...
      </div>
    );
  }

  if (fetchError || !vet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{fetchError || 'Account not found.'}</p>
          <button
            onClick={() => onNavigate('admin-vet-list')}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md"
          >
            Back to Accounts
          </button>
        </div>
      </div>
    );
  }

  const readonlyInput = 'w-full px-3 py-2 border border-border rounded-md text-sm bg-muted text-muted-foreground cursor-not-allowed';

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">

        <button
          onClick={() => onNavigate('admin-vet-list')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Accounts
        </button>

        <h1 className="mb-6">Manage Vet Professional</h1>

        <div className="space-y-5">

          {/* Account details — read only */}
          <div className="bg-white rounded-lg border border-border p-6">
            <h3 className="mb-4">Account Details</h3>
            <div className="space-y-4">

              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Full Name</label>
                <input type="text" value={vet.fullName} disabled className={readonlyInput} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Email Address</label>
                <input type="email" value={vet.email} disabled className={readonlyInput} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Password</label>
                <input type="password" value="••••••••" disabled className={readonlyInput} />
                <p className="text-xs text-muted-foreground mt-1">
                  Password is not visible to administrators.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">Role</label>
                  <input type="text" value="Veterinary Professional" disabled className={readonlyInput} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">Registered</label>
                  <input type="text" value={formatDate(vet.createdAt)} disabled className={readonlyInput} />
                </div>
              </div>
            </div>
          </div>

          {/* Account status */}
          <div className="bg-white rounded-lg border border-border p-6">
            <h3 className="mb-4">Account Status</h3>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {vet.isSuspended ? (
                  <>
                    <span className="flex items-center gap-1.5 px-3 py-1 text-sm rounded-full bg-destructive/10 text-destructive font-medium">
                      <UserX className="w-4 h-4" />
                      Suspended
                    </span>
                    <p className="text-xs text-muted-foreground">This account cannot log in.</p>
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-1.5 px-3 py-1 text-sm rounded-full bg-success/10 text-success font-medium">
                      <UserCheck className="w-4 h-4" />
                      Active
                    </span>
                    <p className="text-xs text-muted-foreground">This account has full access.</p>
                  </>
                )}
              </div>

              <button
                onClick={() => setConfirmAction(vet.isSuspended ? 'reactivate' : 'suspend')}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  vet.isSuspended
                    ? 'bg-success text-white hover:bg-success/90'
                    : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                }`}
              >
                {vet.isSuspended ? 'Reactivate Account' : 'Suspend Account'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Suspension confirmation modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg border border-border p-6 w-full max-w-md shadow-lg">
            <h3 className="mb-2">
              {confirmAction === 'suspend' ? 'Suspend Account' : 'Reactivate Account'}
            </h3>
            <p className="text-sm text-muted-foreground mb-1">
              {confirmAction === 'suspend'
                ? 'Are you sure you want to suspend:'
                : 'Are you sure you want to reactivate:'}
            </p>
            <p className="text-sm font-medium mb-3">{vet.fullName}</p>
            <p className="text-sm text-muted-foreground mb-6">
              {confirmAction === 'suspend'
                ? 'They will immediately lose the ability to log in until the account is reactivated.'
                : 'They will regain full access to their veterinary professional account.'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                disabled={toggling}
                className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleSuspend}
                disabled={toggling}
                className={`px-4 py-2 text-sm rounded-md transition-colors disabled:opacity-50 ${
                  confirmAction === 'suspend'
                    ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    : 'bg-success text-white hover:bg-success/90'
                }`}
              >
                {toggling
                  ? (confirmAction === 'suspend' ? 'Suspending…' : 'Reactivating…')
                  : (confirmAction === 'suspend' ? 'Suspend'      : 'Reactivate')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Routes to ManageVetDetail when a vetId is provided, or AddVetForm for creating a new vet account.
export function AddEditUserPage({ onNavigate, vetId }: AddEditUserPageProps) {
  if (vetId) {
    return <ManageVetDetail vetId={vetId} onNavigate={onNavigate} />;
  }
  return <AddVetForm onNavigate={onNavigate} />;
}
