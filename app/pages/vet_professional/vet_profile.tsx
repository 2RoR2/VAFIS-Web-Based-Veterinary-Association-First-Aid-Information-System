import { useState } from 'react';
import { AuthUser } from '../AuthPage';
import { apiPut } from '../../services/api';

interface VetProfilePageProps {
  onNavigate: (page: string, data?: any) => void;
  currentUser: AuthUser | null;
  onUserUpdate: (user: AuthUser) => void;
}

interface UpdateProfileResponse {
  user: { fullName: string; email: string; role: string };
}

export function VetProfilePage({ onNavigate, currentUser, onUserUpdate }: VetProfilePageProps) {
  // ── Account Details form ─────────────────────────────────────────────────
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
      onUserUpdate({
        name: res.user.fullName,
        email: res.user.email,
        role: currentUser!.role,
      });
      setProfileSuccess('Profile updated successfully.');
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  // ── Change Password form ─────────────────────────────────────────────────
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

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Page header */}
        <div>
          <h1 className="mb-1">Account Settings</h1>
          <p className="text-muted-foreground">Manage your profile details and security settings.</p>
        </div>

        {/* Account Details */}
        <section className="bg-white rounded-lg border border-border p-6">
          <h2 className="mb-1">Account Details</h2>
          <p className="text-sm text-muted-foreground mb-5">Update your display name and email address.</p>

          {profileSuccess && (
            <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
              {profileSuccess}
            </div>
          )}
          {profileError && (
            <div className="mb-4 rounded-md border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {profileError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Full Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Email Address <span className="text-destructive">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <input
                type="text"
                value="Veterinary Professional"
                disabled
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-muted text-muted-foreground cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleProfileSave}
              disabled={profileSaving}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {profileSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </section>

        {/* Change Password */}
        <section className="bg-white rounded-lg border border-border p-6">
          <h2 className="mb-1">Change Password</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Enter your current password to set a new one. Minimum 6 characters.
          </p>

          {passwordSuccess && (
            <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
              {passwordSuccess}
            </div>
          )}
          {passwordError && (
            <div className="mb-4 rounded-md border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {passwordError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handlePasswordSave}
              disabled={passwordSaving}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {passwordSaving ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </section>

        {/* MFA Settings — Coming Soon */}
        <section className="bg-white rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-1">
            <h2>MFA Settings</h2>
            <span className="px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded-full">
              Coming Soon
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Multi-factor authentication adds an extra layer of security to your account.
          </p>
          <div className="rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            MFA configuration is not yet available. This feature will be enabled in a future update.
          </div>
        </section>

      </div>
    </div>
  );
}
