import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

export function Navbar(): ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout, branch } = useAuthStore();
  const { isSidebarOpen, toggleSidebar, pageTitle } = useUIStore();

  const handleLogout = (): void => {
    logout();
    navigate('/auth/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="lg:hidden"
            aria-label="Toggle sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn('hidden lg:flex', !isSidebarOpen && 'lg:flex')}
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </Button>
          <h1 className="text-xl font-semibold">{pageTitle || t('navbar.wms')}</h1>
        </div>
        <div className="ml-auto flex items-center gap-4">
          {user && (
            <div className="hidden sm:flex items-center gap-3 text-sm">
              {branch && (
                <span className="text-muted-foreground">
                  {branch.code && <span className="font-medium">{branch.code}</span>}
                  {branch.name && (
                    <span className={branch.code ? ' ml-1' : ''}>{branch.name}</span>
                  )}
                </span>
              )}
              {branch && <span className="text-muted-foreground">•</span>}
              <span className="text-muted-foreground">
                {user.name || user.email}
              </span>
            </div>
          )}
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            {t('auth.logout')}
          </Button>
        </div>
      </div>
    </header>
  );
}

