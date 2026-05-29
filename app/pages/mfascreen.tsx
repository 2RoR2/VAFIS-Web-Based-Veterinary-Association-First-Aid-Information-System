import { ArrowLeft, Mail, ShieldCheck } from 'lucide-react';
import { ClipboardEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { AuthUser } from './AuthPage';
import { authMfaVerify } from '../services/api';

interface MfaScreenPageProps {
  onNavigate: (page: string, data?: any) => void;
  tempToken: string | null | undefined;
  onAuthSuccess: (user: AuthUser) => void;
}

export function MfaScreenPage({ onNavigate, tempToken, onAuthSuccess }: MfaScreenPageProps) {
  const [digits, setDigits]   = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first box on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // ── Digit box handlers ────────────────────────────────────────────────────

  const handleChange = (index: number, value: string) => {
    // Accept only the last digit typed (handles autofill that dumps all chars at once)
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError('');

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        // Clear current box
        const next = [...digits];
        next[index] = '';
        setDigits(next);
      } else if (index > 0) {
        // Move to previous box
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    const next = ['', '', '', '', '', ''];
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setDigits(next);
    setError('');
    // Focus the last filled box or box after the last filled one
    const focusIdx = Math.min(text.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const otp = digits.join('');
  const isComplete = otp.length === 6;

  const handleVerify = async () => {
    if (!isComplete) {
      setError('Please enter all 6 digits.');
      return;
    }
    if (!tempToken) {
      setError('Verification session is missing. Please log in again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await authMfaVerify(tempToken, otp);
      onAuthSuccess({
        name: result.user.fullName,
        email: result.user.email,
        role: result.user.role,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed. Please try again.');
      // Clear digits and refocus first box on error so the user can re-enter
      setDigits(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  // ── No temp token guard ───────────────────────────────────────────────────

  if (!tempToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-10 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-border shadow-xl p-10 text-center">
          <div className="paw-badge w-14 h-14 mx-auto mb-5" aria-hidden="true" />
          <h2 className="mb-2">Session expired</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Your verification session is no longer valid. Please log in again to receive a new code.
          </p>
          <button
            onClick={() => onNavigate('login')}
            className="w-full bg-primary text-primary-foreground rounded-xl px-5 py-3 hover:bg-primary/90 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // ── Main screen ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      {/* Full-page soft gradient, same mood as AuthPage */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-primary/6 via-background to-accent/20 pointer-events-none" />

      <div className="max-w-md mx-auto">

        {/* Back link */}
        <button
          onClick={() => onNavigate('login')}
          className="mb-8 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>

        {/* Card */}
        <div className="bg-white/85 backdrop-blur-xl rounded-2xl border border-white/70 shadow-2xl p-8 sm:p-10">

          {/* Brand */}
          <div className="flex items-center gap-3 mb-8">
            <div className="paw-badge w-12 h-12 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-primary leading-none">VAFIS</p>
              <p className="text-xs text-muted-foreground">Secure sign-in</p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl mb-2">Two-factor verification</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To keep your account secure, we've sent a 6-digit code to your email address.
              Enter it below — the code expires in 10 minutes.
            </p>
          </div>

          {/* Email hint */}
          <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg mb-6 text-sm text-muted-foreground">
            <Mail className="w-4 h-4 flex-shrink-0" />
            Check your inbox for the verification code.
          </div>

          {/* 6-digit boxes */}
          <div className="flex gap-2 sm:gap-3 justify-center mb-6">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={2}           /* allow 2 so handleChange can grab the latest char */
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                onFocus={(e) => e.target.select()}
                disabled={loading}
                className={`
                  w-11 h-14 sm:w-12 sm:h-16
                  text-center text-xl font-semibold
                  border-2 rounded-xl bg-white
                  transition-colors outline-none
                  disabled:opacity-50
                  ${digit
                    ? 'border-primary text-primary'
                    : 'border-border text-foreground'
                  }
                  focus:border-primary focus:ring-2 focus:ring-primary/20
                `}
              />
            ))}
          </div>

          {/* Separator line between groups of 3 */}
          {/* (visual grouping already comes from the gap; no extra dash needed) */}

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive text-center">
              {error}
            </div>
          )}

          {/* Verify button */}
          <button
            onClick={handleVerify}
            disabled={loading || !isComplete}
            className="w-full bg-primary text-primary-foreground rounded-xl px-5 py-3.5 text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Verifying…
              </span>
            ) : (
              'Verify and sign in'
            )}
          </button>

          {/* Footer note */}
          <p className="mt-5 text-center text-xs text-muted-foreground">
            Didn't receive a code?{' '}
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="text-primary hover:underline"
            >
              Go back and log in again
            </button>
            {' '}to request a new one.
          </p>

        </div>
      </div>
    </div>
  );
}
