import { ChevronDown, LayoutDashboard, LogOut, Menu, PawPrint, Phone, Settings, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { AuthUser } from '../../pages/AuthPage';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  currentUser: AuthUser | null;
  onLogout: () => void;
}

const roleLabels: Record<AuthUser['role'], string> = {
  'pet-owner': 'Pet Owner',
  'veterinary-professional': 'Veterinary Professional',
  administrator: 'Administrator',
};

// Renders the public navigation header with links, an account dropdown for pet owners, and login/signup buttons for guests.
export function Header({ onNavigate, currentPage, currentUser, onLogout }: HeaderProps) {
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Closes the account dropdown when the user clicks outside of it.
    function handleClickOutside(event: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const homePage =
    currentUser?.role === 'administrator'
      ? 'admin-workflow'
      : currentUser?.role === 'veterinary-professional'
      ? 'professional-dashboard'
      : currentUser?.role === 'pet-owner'
      ? 'home'
      : 'home';

  const homePages = ['home', 'admin-workflow', 'professional-dashboard', 'pet-dashboard'];
  const accountPages = ['pet-owner-profile', 'pet-profile'];

  // Closes the account dropdown then navigates to the given page.
  const navigate = (page: string) => {
    setAccountOpen(false);
    onNavigate(page);
  };

  return (
    <header className="bg-white/90 backdrop-blur border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate(homePage)}>
            <div className="paw-badge w-11 h-11 flex-shrink-0" aria-hidden="true">
              <span className="sr-only">VAFIS paw logo</span>
            </div>
            <div>
              <h1 className="text-lg text-primary">VAFIS</h1>
              <p className="text-xs text-muted-foreground">Cute pet first-aid support</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => onNavigate(homePage)}
              className={`px-3 py-2 rounded-md transition-colors ${
                homePages.includes(currentPage) ? 'bg-secondary text-secondary-foreground' : 'hover:bg-muted'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('emergency')}
              className={`px-3 py-2 rounded-md transition-colors ${
                currentPage === 'emergency' ? 'bg-secondary text-secondary-foreground' : 'hover:bg-muted'
              }`}
            >
              Emergency Guide
            </button>
            <button
              onClick={() => onNavigate('videos')}
              className={`px-3 py-2 rounded-md transition-colors ${
                currentPage === 'videos' ? 'bg-secondary text-secondary-foreground' : 'hover:bg-muted'
              }`}
            >
              Videos
            </button>
            <button
              onClick={() => onNavigate('quiz')}
              className={`px-3 py-2 rounded-md transition-colors ${
                currentPage === 'quiz' ? 'bg-secondary text-secondary-foreground' : 'hover:bg-muted'
              }`}
            >
              Quiz
            </button>
            <button
              onClick={() => onNavigate('feedback')}
              className={`px-3 py-2 rounded-md transition-colors ${
                currentPage === 'feedback' ? 'bg-secondary text-secondary-foreground' : 'hover:bg-muted'
              }`}
            >
              Feedback
            </button>
            <button
              onClick={() => onNavigate('clinics')}
              className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
            >
              <Phone className="w-4 h-4" />
              Find a Vet
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-muted rounded-md transition-colors md:hidden" aria-label="Menu">
              <Menu className="w-5 h-5" />
            </button>
            {currentUser ? (
              <div className="hidden md:flex items-center gap-2">
                {currentUser.role === 'pet-owner' ? (
                  <div className="relative" ref={accountRef}>
                    <button
                      onClick={() => setAccountOpen((prev) => !prev)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-colors ${
                        accountPages.includes(currentPage)
                          ? 'bg-secondary text-secondary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                      aria-expanded={accountOpen}
                      aria-haspopup="menu"
                    >
                      <User className="w-4 h-4" />
                      {currentUser.name || roleLabels[currentUser.role]}
                      <ChevronDown className={`w-4 h-4 transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {accountOpen && (
                      <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-md border border-border bg-white py-1 shadow-md" role="menu">
                        <button
                          onClick={() => navigate('pet-dashboard')}
                          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors hover:bg-muted"
                          role="menuitem"
                        >
                          <LayoutDashboard className="w-4 h-4 text-primary" />
                          Dashboard
                        </button>
                        <button
                          onClick={() => navigate('pet-owner-profile')}
                          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors hover:bg-muted"
                          role="menuitem"
                        >
                          <Settings className="w-4 h-4 text-primary" />
                          Account Profile
                        </button>
                        <button
                          onClick={() => navigate('pet-profile')}
                          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors hover:bg-muted"
                          role="menuitem"
                        >
                          <PawPrint className="w-4 h-4 text-primary" />
                          Pet Profiles
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => navigate(currentUser.role === 'veterinary-professional' ? 'professional-dashboard' : 'admin-workflow')}
                    className="px-3 py-2 bg-secondary text-secondary-foreground rounded-full text-sm"
                  >
                    {roleLabels[currentUser.role]}
                  </button>
                )}
                <button
                  onClick={() => onNavigate('logout')}
                  className="p-2 hover:bg-muted rounded-md transition-colors"
                  aria-label="Log out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    currentPage === 'login' ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => onNavigate('signup')}
                  className="px-4 py-2 border border-secondary bg-primary/10 text-secondary-foreground rounded-full hover:border-primary hover:bg-primary/15 hover:text-primary transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}
            <button
              onClick={() => {
                if (!currentUser) {
                  onNavigate('login');
                  return;
                }

                onNavigate(currentUser.role === 'pet-owner' ? 'pet-owner-profile' : homePage);
              }}
              className="md:hidden p-2 hover:bg-muted rounded-md transition-colors"
              aria-label={currentUser?.role === 'pet-owner' ? 'Pet owner profile' : 'Role dashboard'}
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
