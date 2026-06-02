import { Bell, ChevronDown, LogOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { AuthUser } from '../../pages/AuthPage';

interface AdminHeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  currentUser: AuthUser | null;
  onLogout: () => void;
}

const contentSubPages = [
  'admin-video-list', 'admin-video-add', 'admin-video-edit',
  'admin-quiz-list', 'admin-quiz-create', 'admin-quiz-edit', 'admin-quiz-questions', 'admin-quiz-preview',
  'admin-species-list', 'admin-species-add', 'admin-species-edit',
  'admin-scenario-list', 'admin-scenario-add', 'admin-scenario-edit',
  'admin-category-list', 'admin-category-add', 'admin-category-edit',
];
const guideSubPages = ['admin-guide-list', 'admin-guide-create', 'admin-guide-edit', 'admin-guide-detail', 'admin-guide-approve'];
const vetSubPages   = ['admin-vet-list', 'admin-vet-add', 'admin-vet-detail'];

// Returns the CSS class string for a nav button, applying active styles when the given condition is true.
const navItem = (active: boolean) =>
  `px-3 py-2 rounded-md transition-colors text-sm ${
    active ? 'bg-secondary text-secondary-foreground' : 'hover:bg-muted'
  }`;

// Renders the administrator navigation header with a Content dropdown, guide/user/feedback links, notifications, and profile access.
export function AdminHeader({ onNavigate, currentPage, currentUser, onLogout }: AdminHeaderProps) {
  const [contentOpen, setContentOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Closes the Content dropdown when the user clicks outside of it.
    function handleClickOutside(e: MouseEvent) {
      if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
        setContentOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Closes the Content dropdown then navigates to the given page.
  const navigate = (page: string) => {
    setContentOpen(false);
    onNavigate(page);
  };

  return (
    <header className="bg-white/90 backdrop-blur border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Left: Logo + Admin Panel badge */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('admin-workflow')}>
            <div className="paw-badge w-11 h-11 flex-shrink-0" aria-hidden="true">
              <span className="sr-only">VAFIS paw logo</span>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg text-primary">VAFIS</h1>
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20 select-none">
                Admin Panel
              </span>
            </div>
          </div>

          {/* Middle: Navigation */}
          <nav className="flex items-center gap-1">
            <button onClick={() => navigate('admin-workflow')} className={navItem(currentPage === 'admin-workflow')}>
              Dashboard
            </button>

            <button onClick={() => navigate('admin-guide-list')} className={navItem(guideSubPages.includes(currentPage))}>
              Guides
            </button>

            {/* Content dropdown */}
            <div className="relative" ref={contentRef}>
              <button
                onClick={() => setContentOpen((prev) => !prev)}
                className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors text-sm ${
                  contentSubPages.includes(currentPage)
                    ? 'bg-secondary text-secondary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                Content
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${contentOpen ? 'rotate-180' : ''}`} />
              </button>

              {contentOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-md shadow-md py-1 min-w-[140px] z-50">
                  {[
                    { label: 'Videos', page: 'admin-video-list' },
                    { label: 'Quizzes', page: 'admin-quiz-list' },
                    { label: 'Species', page: 'admin-species-list' },
                    { label: 'Scenarios', page: 'admin-scenario-list' },
                    { label: 'Categories', page: 'admin-category-list' },
                  ].map(({ label, page }) => (
                    <button
                      key={page}
                      onClick={() => navigate(page)}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        currentPage === page ? 'bg-secondary text-secondary-foreground' : 'hover:bg-muted'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => navigate('manage-clinic')} className={navItem(currentPage === 'manage-clinic')}>
              Clinics
            </button>

            <button onClick={() => navigate('admin-vet-list')} className={navItem(vetSubPages.includes(currentPage))}>
              Users
            </button>

            <button onClick={() => navigate('admin-feedback-list')} className={navItem(currentPage === 'admin-feedback-list')}>
              Feedback
            </button>

            <button onClick={() => navigate('audit-log')} className={navItem(currentPage === 'audit-log')}>
              Audit Log
            </button>
          </nav>

          {/* Right: Notification bell + user */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('notifications')}
              className="relative p-2 hover:bg-muted rounded-md transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-medium rounded-full flex items-center justify-center leading-none">
                3
              </span>
            </button>

            {currentUser && (
              <button
                onClick={() => navigate('admin-profile')}
                className="px-3 py-2 bg-secondary text-secondary-foreground rounded-full text-sm hover:bg-secondary/80 transition-colors"
                title="Account settings"
              >
                {currentUser.name}
              </button>
            )}

            <button
              onClick={onLogout}
              className="p-2 hover:bg-muted rounded-md transition-colors"
              aria-label="Log out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
