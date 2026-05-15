import { ShieldCheck, Sparkles, Stethoscope, UserRound } from 'lucide-react';
import { FormEvent, useState } from 'react';
import heroImage from '../assets/hero-pets-first-aid.png';

export type UserRole = 'pet-owner' | 'veterinary-professional' | 'administrator';

export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
}

interface AuthPageProps {
  mode: 'login' | 'signup';
  onNavigate: (page: string, data?: any) => void;
  onAuthSuccess: (user: AuthUser) => void;
}

const roles = [
  {
    id: 'pet-owner' as const,
    title: 'Pet Owner',
    description: 'Emergency guidance, quizzes, videos, clinics, and feedback.',
    icon: UserRound,
  },
  {
    id: 'veterinary-professional' as const,
    title: 'Veterinary Professional',
    description: 'Clinical review dashboard for validating medical content.',
    icon: Stethoscope,
  },
  {
    id: 'administrator' as const,
    title: 'Association Administrator',
    description: 'Content lifecycle, approvals, publishing, audit and notification tools.',
    icon: ShieldCheck,
  },
];

export function AuthPage({ mode, onNavigate, onAuthSuccess }: AuthPageProps) {
  const isSignup = mode === 'signup';
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') || 'user@vafis.local');
    const roleFromEmail = (em: string): UserRole => {
      const lower = em.toLowerCase();
      if (lower.includes('admin')) return 'administrator';
      if (lower.includes('vet')) return 'veterinary-professional';
      if (lower.includes('owner')) return 'pet-owner';
      return 'pet-owner';
    };
    const role = roleFromEmail(email);
    const name = String(form.get('name') || roles.find((item) => item.id === role)?.title || 'VAFIS User');
    const password = String(form.get('password') || '');

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters for this prototype.');
      return;
    }

    if (!isSignup && password.toLowerCase() === 'wrong') {
      setError('Login failed. Please check your email, password, and role.');
      return;
    }

    setError('');
    onAuthSuccess({ name, email, role });
  };

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 shadow-2xl backdrop-blur">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-white/40 to-accent/40" />
          <div className="relative grid lg:grid-cols-[1.05fr_0.95fr] min-h-[760px]">
            <section className="relative p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
              <div>
                
                <h1 className="text-4xl lg:text-5xl leading-tight mb-5">
                  {isSignup ? 'Create a trusted VAFIS account' : 'Welcome back to trusted pet first-aid care'}
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mb-8">
                  A polished access experience for pet owners, veterinary professionals, and association administrators, with fast public guidance and secure internal dashboards.
                </p>
              </div>

              <div className="relative rounded-[1.7rem] overflow-hidden border border-white/80 shadow-xl bg-white">
                <img
                  src={heroImage}
                  alt="Real dog and cat beside premium pet first-aid supplies"
                  className="w-full aspect-[5/3] object-cover"
                />
                
              </div>
            </section>

            <section className="p-6 sm:p-10 lg:p-12 bg-white/85 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-white/80">
              <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
                <div className="mb-8">
                  <div className="paw-badge w-16 h-16 mb-5" aria-hidden="true" />
                  <p className="text-sm text-primary mb-2">{isSignup ? 'New account' : 'Secure access'}</p>
                  <h2 className="text-3xl mb-2">{isSignup ? 'Sign up' : 'Log in'}</h2>
                  
                  {error && (
                    <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}
                </div>

                {isSignup && (
                  <label className="block mb-5">
                    Full name
                    <input name="name" type="text" placeholder="Enter your name" className="mt-2 h-12 rounded-xl bg-white/90" />
                  </label>
                )}

                <label className="block mb-5">
                  Email
                  <input name="email" type="email" placeholder="name@example.com" className="mt-2 h-12 rounded-xl bg-white/90" />
                </label>

                <label className="block mb-6">
                  Password
                  <input name="password" type="password" placeholder="Enter password" className="mt-2 h-12 rounded-xl bg-white/90" />
                </label>

                {/* Role is inferred from demo credentials (email). No role selector shown. */}

                <button type="submit" className="w-full bg-primary text-primary-foreground rounded-2xl px-5 py-3.5 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                  {isSignup ? 'Create account' : 'Log in'}
                </button>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                  {isSignup ? 'Already have an account?' : 'New to VAFIS?'}{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate(isSignup ? 'login' : 'signup')}
                    className="text-primary hover:underline"
                  >
                    {isSignup ? 'Log in' : 'Sign up'}
                  </button>
                </div>

                
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
