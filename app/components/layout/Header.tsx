import { LogOut, Menu, Phone, User } from 'lucide-react';
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

export function Header({ onNavigate, currentPage, currentUser, onLogout }: HeaderProps) {
  const homePage =
    currentUser?.role === 'administrator'
      ? 'admin-workflow'
      : currentUser?.role === 'veterinary-professional'
      ? 'professional-dashboard'
      : currentUser?.role === 'pet-owner'
      ? 'pet-dashboard'
      : 'home';

  const homePages = ['home', 'admin-workflow', 'professional-dashboard', 'pet-dashboard'];

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
                <button
                  onClick={() => onNavigate(currentUser.role === 'pet-owner' ? 'pet-owner-profile' : currentUser.role === 'veterinary-professional' ? 'professional-dashboard' : 'admin-workflow')}
                  className="px-3 py-2 bg-secondary text-secondary-foreground rounded-full text-sm"
                >
                  {roleLabels[currentUser.role]}
                </button>
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
              onClick={() => onNavigate('admin')}
              className="md:hidden p-2 hover:bg-muted rounded-md transition-colors"
              aria-label="Role dashboard"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
