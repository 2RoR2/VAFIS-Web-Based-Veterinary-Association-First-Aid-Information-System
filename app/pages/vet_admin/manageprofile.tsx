import { CheckCircle, Eye, EyeOff, KeyRound, Loader2, Shield, ShieldCheck, ShieldOff, User } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { AuthUser } from '../../pages/AuthPage';
import { apiGet, apiPost, apiPut, SessionUser } from '../../services/api';

interface AdminProfilePageProps {
  onNavigate: (page: string, data?: any) => void;
  currentUser: AuthUser | null;
  onUserUpdate: (user: AuthUser) => void;
}

// ── Shared helpers ─────────────────────────────────────────────────────────────

const inputCls =
  'w-full px-3 py-2 border border-border rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-muted disabled:text-muted-foreground';

const SectionCard = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-lg border border-border overflow-hidden">
    <div className="px-6 py-4 border-b border-border flex items-center gap-2">
      <Icon className="w-4 h-4 text-primary" />
      <h2 className="text-base font-medium">{title}</h2>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const SuccessBanner = ({ message }: { message: string }) => (
  <div className="flex items-center gap-2 px-4 py-3 bg-success/10 border border-success/30 rounded-md text-sm text-success">
    <CheckCircle className="w-4 h-4 flex-shrink-0" />
    {message}
  </div>
);

const ErrorBanner = ({ message }: { message: string }) => (
  <div className="px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-md text-sm text-destructive">
    {message}
  </div>
);

// ── Section 1: Profile Information ────────────────────────────────────────────

function ProfileSection({
  currentUser,
  onUserUpdate,
}: {
  currentUser: AuthUser | null;
  onUserUpdate: (user: AuthUser) => void;
}) {
  const [fullName, setFullName] = useState(currentUser?.name ?? '');
  const [email, setEmail]       = useState(currentUser?.email ?? '');
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState('');
  const [error, setError]       = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { setError('Full name is required.'); return; }
    if (!email.trim() || !email.includes('@')) { setError('A valid email address is required.'); return; }

    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const data = await apiPut<{ user: SessionUser }>('/user/profile', {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
      });
      // Propagate updated name/email to App state so the header refreshes
      onUserUpdate({
        name: data.user.fullName,
        email: data.user.email,
        role: data.user.role,
      });
      setFullName(data.user.fullName);
      setEmail(data.user.email);
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionCard title="Profile Information" icon={User}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {success && <SuccessBanner message={success} />}
        {error   && <ErrorBanner  message={error}   />}

        <div>
          <label className="block text-sm font-medium mb-1">Full name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputCls}
            placeholder="Your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            placeholder="name@example.com"
          />
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}

// ── Section 2: Change Password ─────────────────────────────────────────────────

function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent]         = useState(false);
  const [showNew, setShowNew]                 = useState(false);
  const [loading, setLoading]                 = useState(false);
  const [success, setSuccess]                 = useState('');
  const [error, setError]                     = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentPassword) { setError('Current password is required.'); return; }
    if (newPassword.length < 6) { setError('New password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('New passwords do not match.'); return; }

    setLoading(true);
    setSuccess('');
    setError('');

    try {
      await apiPut<{ message: string }>('/user/password', { currentPassword, newPassword });
      setSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  const PasswordInput = ({
    label,
    value,
    onChange,
    show,
    onToggle,
    placeholder,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    show: boolean;
    onToggle: () => void;
    placeholder?: string;
  }) => (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${inputCls} pr-10`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <SectionCard title="Change Password" icon={KeyRound}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {success && <SuccessBanner message={success} />}
        {error   && <ErrorBanner  message={error}   />}

        <PasswordInput
          label="Current password"
          value={currentPassword}
          onChange={setCurrentPassword}
          show={showCurrent}
          onToggle={() => setShowCurrent((v) => !v)}
          placeholder="Enter current password"
        />
        <PasswordInput
          label="New password"
          value={newPassword}
          onChange={setNewPassword}
          show={showNew}
          onToggle={() => setShowNew((v) => !v)}
          placeholder="At least 6 characters"
        />
        <div>
          <label className="block text-sm font-medium mb-1">Confirm new password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            className={inputCls}
          />
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}

// ── Section 3: Two-Factor Authentication ──────────────────────────────────────

type MfaUiState = 'idle' | 'initiating' | 'verifying' | 'disabling';

function MfaSection() {
  const [mfaEnabled, setMfaEnabled]   = useState<boolean | null>(null);
  const [uiState, setUiState]         = useState<MfaUiState>('idle');
  const [otp, setOtp]                 = useState('');
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loading, setLoading]         = useState(false);
  const [statusMsg, setStatusMsg]     = useState('');
  const [success, setSuccess]         = useState('');
  const [error, setError]             = useState('');
  const otpRef = useRef<HTMLInputElement>(null);

  // Load current MFA status on mount
  useEffect(() => {
    apiGet<{ mfaEnabled: boolean }>('/mfa/status')
      .then((d) => setMfaEnabled(d.mfaEnabled))
      .catch(() => setError('Could not load 2FA status.'))
      .finally(() => setLoadingStatus(false));
  }, []);

  // Focus OTP input when the verify step appears
  useEffect(() => {
    if (uiState === 'verifying') {
      setTimeout(() => otpRef.current?.focus(), 50);
    }
  }, [uiState]);

  const reset = () => {
    setUiState('idle');
    setOtp('');
    setError('');
  };

  // Step 1: request OTP to be emailed
  const handleInitiateEnable = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setUiState('initiating');
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

  // Step 2: verify OTP and enable MFA
  const handleVerifyEnable = async (e: FormEvent) => {
    e.preventDefault();
    const code = otp.trim();
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setError('Please enter the 6-digit code from your email.');
      return;
    }
    setLoading(true);
    setError('');
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

  // Disable MFA
  const handleDisable = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setUiState('disabling');
    try {
      await apiPost<{ mfaEnabled: boolean }>('/mfa/disable', {});
      setMfaEnabled(false);
      setSuccess('Two-factor authentication has been disabled.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable 2FA.');
    } finally {
      setLoading(false);
      setUiState('idle');
    }
  };

  return (
    <SectionCard title="Two-Factor Authentication" icon={Shield}>
      {loadingStatus ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading 2FA status…
        </div>
      ) : (
        <div className="space-y-4">
          {success && <SuccessBanner message={success} />}
          {error   && <ErrorBanner  message={error}   />}

          {/* Status badge */}
          <div className="flex items-center gap-3">
            {mfaEnabled ? (
              <>
                <ShieldCheck className="w-5 h-5 text-success" />
                <div>
                  <p className="text-sm font-medium text-success">2FA is enabled</p>
                  <p className="text-xs text-muted-foreground">
                    You will be asked for a verification code every time you log in.
                  </p>
                </div>
              </>
            ) : (
              <>
                <ShieldOff className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">2FA is disabled</p>
                  <p className="text-xs text-muted-foreground">
                    Add an extra layer of security by requiring a one-time code at login.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* OTP verify form (shown after initiate step) */}
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
                  className={`${inputCls} tracking-widest text-center text-lg w-40`}
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="px-5 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Verifying…' : 'Verify and enable'}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Action buttons (shown when idle) */}
          {uiState === 'idle' && (
            <div className="pt-1">
              {mfaEnabled ? (
                <button
                  onClick={handleDisable}
                  disabled={loading}
                  className="px-5 py-2 bg-destructive text-destructive-foreground rounded-md text-sm hover:bg-destructive/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Disable two-factor authentication
                </button>
              ) : (
                <button
                  onClick={handleInitiateEnable}
                  disabled={loading}
                  className="px-5 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Enable two-factor authentication
                </button>
              )}
            </div>
          )}

          {/* Sending state */}
          {uiState === 'initiating' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
              <Loader2 className="w-4 h-4 animate-spin" /> Sending verification code…
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export function AdminProfilePage({ onNavigate: _onNavigate, currentUser, onUserUpdate }: AdminProfilePageProps) {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="mb-1">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your profile, password, and two-factor authentication.
          </p>
        </div>

        <div className="space-y-6">
          <ProfileSection currentUser={currentUser} onUserUpdate={onUserUpdate} />
          <PasswordSection />
          <MfaSection />
        </div>

      </div>
    </div>
  );
}
