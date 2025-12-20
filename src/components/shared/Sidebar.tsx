import { type ReactElement, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href?: string;
  icon?: ReactElement;
  children?: NavItem[];
}

interface SidebarProps {
  items: NavItem[];
}

function NavItemComponent({ item }: { item: NavItem }): ReactElement {
  const location = useLocation();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href ? location.pathname === item.href : false;
  const isChildActive = item.children?.some(
    (child) => child.href && location.pathname === child.href
  );
  const [isExpanded, setIsExpanded] = useState(isChildActive);

  useEffect(() => {
    if (isChildActive) {
      setIsExpanded(true);
    }
  }, [isChildActive]);

  const handleIconClick = (e: React.MouseEvent): void => {
    if (!isSidebarOpen) {
      e.preventDefault();
      e.stopPropagation();
      setSidebarOpen(true);
    }
  };

  if (hasChildren) {
    return (
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => {
            if (!isSidebarOpen) {
              setSidebarOpen(true);
            } else {
              setIsExpanded(!isExpanded);
            }
          }}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            isChildActive
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground',
            !isSidebarOpen && 'justify-center'
          )}
        >
          {item.icon && (
            <span
              className={cn('flex-shrink-0', !isSidebarOpen && 'mx-auto')}
              onClick={handleIconClick}
            >
              {item.icon}
            </span>
          )}
          <span
            className={cn(
              'flex-1 truncate text-left transition-opacity',
              !isSidebarOpen && 'hidden'
            )}
          >
            {item.title}
          </span>
          {isSidebarOpen && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn(
                'transition-transform',
                isExpanded && 'rotate-90'
              )}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          )}
        </button>
        {isExpanded && isSidebarOpen && (
          <div className="ml-4 space-y-1 border-l pl-4">
            {item.children?.map((child) => {
              const isChildActive = location.pathname === child.href;
              return (
                <Link
                  key={child.href}
                  to={child.href || '#'}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    isChildActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground'
                  )}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      useUIStore.getState().setSidebarOpen(false);
                    }
                  }}
                >
                  <span className="truncate">{child.title}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (!item.href) {
    return <></>;
  }

  return (
    <Link
      to={item.href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        isActive
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground',
        !isSidebarOpen && 'justify-center'
      )}
      onClick={(e) => {
        if (!isSidebarOpen) {
          e.preventDefault();
          setSidebarOpen(true);
        } else {
          if (window.innerWidth < 1024) {
            setSidebarOpen(false);
          }
        }
      }}
    >
      {item.icon && (
        <span
          className={cn('flex-shrink-0', !isSidebarOpen && 'mx-auto')}
          onClick={handleIconClick}
        >
          {item.icon}
        </span>
      )}
      <span
        className={cn(
          'truncate transition-opacity',
          !isSidebarOpen && 'hidden'
        )}
      >
        {item.title}
      </span>
    </Link>
  );
}

export function Sidebar({ items }: SidebarProps): ReactElement {
  const { isSidebarOpen } = useUIStore();

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => useUIStore.getState().setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-16 bottom-16 z-40 w-64 border-r bg-background transition-transform duration-300 ease-in-out lg:translate-x-0 overflow-y-auto',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:w-16'
        )}
      >
        <nav className="flex h-full flex-col gap-1 p-4">
          {items.map((item, index) => (
            <NavItemComponent key={item.href || item.title || index} item={item} />
          ))}
        </nav>
      </aside>
    </>
  );
}

