import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AuthUser } from '../../pages/AuthPage';

interface VetHeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  currentUser: AuthUser | null;
  onLogout: () => void;
}

const navItem = (active: boolean) =>
  `px-3 py-2 rounded-md transition-colors text-sm ${
    active ? 'bg-secondary text-secondary-foreground' : 'hover:bg-muted'
  }`;

export function VetHeader({ onNavigate, currentPage, currentUser, onLogout }: VetHeaderProps) {
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    fetch('/api/workflow/notifications')
      .then((res) => res.json())
      .then((data: unknown[]) => setNotificationCount(data.length))
      .catch(() => setNotificationCount(0));
  }, []);

  return (
    <header className="bg-white/90 backdrop-blur border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Left: Logo + Vet Professional badge */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('professional-dashboard')}>
            <div className="paw-badge w-11 h-11 flex-shrink-0" aria-hidden="true">
              <span className="sr-only">VAFIS paw logo</span>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg text-primary">VAFIS</h1>
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20 select-none">
                Vet Professional
              </span>
            </div>
          </div>

          {/* Middle: Navigation */}
          <nav className="flex items-center gap-1">
            <button onClick={() => onNavigate('professional-dashboard')} className={navItem(currentPage === 'professional-dashboard')}>
              Dashboard
            </button>
            <button onClick={() => onNavigate('vet-review-queue')} className={navItem(currentPage === 'vet-review-queue')}>
              Review Queue
            </button>
            <button onClick={() => onNavigate('vet-review-history')} className={navItem(currentPage === 'vet-review-history')}>
              Review History
            </button>
            <button onClick={() => onNavigate('vet-videos')} className={navItem(currentPage === 'vet-videos')}>
              Videos
            </button>
          </nav>

          {/* Right: Notification bell + user name + logout */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('notifications')}
              className="relative p-2 hover:bg-muted rounded-md transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-medium rounded-full flex items-center justify-center leading-none">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
            </button>

            {currentUser && (
              <button
                onClick={() => onNavigate('vet-profile')}
                className="px-3 py-2 bg-secondary text-secondary-foreground rounded-full text-sm hover:bg-secondary/80 transition-colors"
              >
                {currentUser.name}
              </button>
            )}

            <button
              onClick={onLogout}
              className="px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm text-muted-foreground hover:text-foreground"
              aria-label="Log out"
            >
              Logout
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
