import { useEffect, useRef, useState, FormEvent } from 'react';
import { CheckCircle, Loader2, Shield, ShieldCheck, ShieldOff } from 'lucide-react';
import { AuthUser } from '../AuthPage';
import { apiGet, apiPost, apiPut } from '../../services/api';

interface PetOwnerProfilePageProps {
  onNavigate: (page: string, data?: any) => void;
  currentUser: AuthUser | null;
  onUserUpdate: (user: AuthUser) => void;
}

interface UpdateProfileResponse {
  user: { fullName: string; email: string; role: string };
}

// ── MFA Section ───────────────────────────────────────────────────────────────

type MfaUiState = 'idle' | 'initiating' | 'verifying' | 'disabling';

function MfaSection() {
  const [mfaEnabled, setMfaEnabled]       = useState<boolean | null>(null);
  const [uiState, setUiState]             = useState<MfaUiState>('idle');
  const [otp, setOtp]                     = useState('');
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loading, setLoading]             = useState(false);
  const [statusMsg, setStatusMsg]         = useState('');
  const [success, setSuccess]             = useState('');
  const [error, setError]                 = useState('');
  const otpRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiGet<{ mfaEnabled: boolean }>('/mfa/status')
      .then((d) => setMfaEnabled(d.mfaEnabled))
      .catch(() => setError('Could not load 2FA status.'))
      .finally(() => setLoadingStatus(false));
  }, []);

  useEffect(() => {
    if (uiState === 'verifying') setTimeout(() => otpRef.current?.focus(), 50);
  }, [uiState]);

  const reset = () => { setUiState('idle'); setOtp(''); setError(''); };

  const handleInitiateEnable = async () => {
    setLoading(true); setError(''); setSuccess(''); setUiState('initiating');
    try {
      const d = await apiPost<{ message: string }>('/mfa/enable/initiate', {});
      setStatusMsg(d.message);
      setUiState('verifying');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification code.');
      setUiState('idle');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEnable = async (e: FormEvent) => {
    e.preventDefault();
    const code = otp.trim();
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setError('Please enter the 6-digit code from your email.');
      return;
    }
    setLoading(true); setError('');
    try {
      await apiPost<{ mfaEnabled: boolean }>('/mfa/enable/verify', { otp: code });
      setMfaEnabled(true);
      setSuccess('Two-factor authentication has been enabled.');
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true); setError(''); setSuccess(''); setUiState('disabling');
    try {
      await apiPost<{ mfaEnabled: boolean }>('/mfa/disable', {});
      setMfaEnabled(false);
      setSuccess('Two-factor authentication has been disabled.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable 2FA.');
    } finally {
      setLoading(false); setUiState('idle');
    }
  };

  const inputCls = 'px-3 py-2 border border-border rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary';

  return (
    <section className="bg-white rounded-lg border border-border p-6">
      <div className="flex items-center gap-2 mb-1">
        <Shield className="w-4 h-4 text-primary" />
        <h2>Two-Factor Authentication</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Add an extra layer of security — a one-time code will be emailed to you at every login.
      </p>

      {loadingStatus ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="space-y-4">
          {success && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-md border border-green-200 bg-green-50 text-sm text-green-700">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />{success}
            </div>
          )}
          {error && (
            <div className="px-4 py-2 rounded-md border border-destructive/20 bg-destructive/10 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Status */}
          <div className="flex items-center gap-3">
            {mfaEnabled ? (
              <>
                <ShieldCheck className="w-5 h-5 text-success" />
                <div>
                  <p className="text-sm font-medium text-success">2FA is enabled</p>
                  <p className="text-xs text-muted-foreground">You will need a verification code each time you log in.</p>
                </div>
              </>
            ) : (
              <>
                <ShieldOff className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">2FA is disabled</p>
                  <p className="text-xs text-muted-foreground">Enable it for stronger account security.</p>
                </div>
              </>
            )}
          </div>

          {/* OTP verify form */}
          {uiState === 'verifying' && (
            <form onSubmit={handleVerifyEnable} className="space-y-3 pt-1">
              <p className="text-sm text-muted-foreground">{statusMsg}</p>
              <div>
                <label className="block text-sm font-medium mb-1">Verification code</label>
                <input
                  ref={otpRef}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className={`${inputCls} tracking-widest text-center text-lg w-36`}
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Verifying…' : 'Verify and enable'}
                </button>
                <button type="button" onClick={reset} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Action buttons */}
          {uiState === 'idle' && (
            <div className="pt-1">
              {mfaEnabled ? (
                <button
                  onClick={handleDisable}
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Disable two-factor authentication
                </button>
              ) : (
                <button
                  onClick={handleInitiateEnable}
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Enable two-factor authentication
                </button>
              )}
            </div>
          )}

          {uiState === 'initiating' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
              <Loader2 className="w-4 h-4 animate-spin" /> Sending verification code…
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export function PetOwnerProfilePage({ onNavigate, currentUser, onUserUpdate }: PetOwnerProfilePageProps) {
  const [fullName, setFullName] = useState(currentUser?.name ?? '');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  const handleProfileSave = async () => {
    if (!fullName.trim() || !email.trim()) {
      setProfileError('Full name and email are required.');
      return;
    }
    setProfileSaving(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      const res = await apiPut<UpdateProfileResponse>('/user/profile', {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
      });
      onUserUpdate({ name: res.user.fullName, email: res.user.email, role: currentUser!.role });
      setProfileSuccess('Profile updated successfully.');
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handlePasswordSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }
    setPasswordSaving(true);
    setPasswordError('');
    setPasswordSuccess('');
    try {
      await apiPut<{ message: string }>('/user/password', { currentPassword, newPassword });
      setPasswordSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to update password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary';

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        <div>
          <h1 className="mb-1">Account Settings</h1>
          <p className="text-muted-foreground">Manage your profile details and security settings.</p>
        </div>

        {/* Account Details */}
        <section className="bg-white rounded-lg border border-border p-6">
          <h2 className="mb-1">Account Details</h2>
          <p className="text-sm text-muted-foreground mb-5">Update your display name and email address.</p>

          {profileSuccess && (
            <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">{profileSuccess}</div>
          )}
          {profileError && (
            <div className="mb-4 rounded-md border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">{profileError}</div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name <span className="text-destructive">*</span></label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email Address <span className="text-destructive">*</span></label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <input type="text" value="Pet Owner" disabled
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-muted text-muted-foreground cursor-not-allowed" />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button onClick={handleProfileSave} disabled={profileSaving}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {profileSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </section>

        {/* Change Password */}
        <section className="bg-white rounded-lg border border-border p-6">
          <h2 className="mb-1">Change Password</h2>
          <p className="text-sm text-muted-foreground mb-5">Enter your current password to set a new one. Minimum 6 characters.</p>

          {passwordSuccess && (
            <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">{passwordSuccess}</div>
          )}
          {passwordError && (
            <div className="mb-4 rounded-md border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">{passwordError}</div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password" className={inputCls} />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button onClick={handlePasswordSave} disabled={passwordSaving}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {passwordSaving ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </section>

        <MfaSection />

        <div className="flex justify-start">
          <button onClick={() => onNavigate('pet-dashboard')}
            className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors">
            Back to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}
