import { type ReactElement, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

interface NavItem {
  title: string;
  href?: string;
  icon?: ReactElement;
  children?: NavItem[];
}

interface SidebarProps {
  items: NavItem[];
}

function NavItemComponent({
  item,
  searchQuery,
  expandedItemKey,
  onToggle,
}: {
  item: NavItem;
  searchQuery: string;
  expandedItemKey: string | null;
  onToggle: (key: string) => void;
}): ReactElement {
  const location = useLocation();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href ? location.pathname === item.href : false;
  const isChildActive = item.children?.some(
    (child) => child.href && location.pathname === child.href
  );
  const itemKey = item.href || item.title;
  const isExpanded = expandedItemKey === itemKey;
  const onToggleRef = useRef(onToggle);
  const lastActiveRef = useRef(false);
  const lastSearchRef = useRef('');

  onToggleRef.current = onToggle;

  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ı/g, 'i')
      .replace(/ş/g, 's')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/İ/g, 'i')
      .replace(/Ş/g, 's')
      .replace(/Ğ/g, 'g')
      .replace(/Ü/g, 'u')
      .replace(/Ö/g, 'o')
      .replace(/Ç/g, 'c');
  };

  const childMatchesSearch = useCallback((childTitle: string): boolean => {
    if (!searchQuery.trim()) return true;
    
    const normalizedQuery = normalizeText(searchQuery);
    const queryWords = normalizedQuery.split(/\s+/).filter((word) => word.length > 0);
    
    if (queryWords.length === 0) return true;
    
    const normalizedChildTitle = normalizeText(childTitle);
    const childWords = normalizedChildTitle.split(/\s+/).filter((word) => word.length > 0);
    
    return queryWords.every((queryWord) =>
      childWords.some((childWord) => childWord.includes(queryWord))
    );
  }, [searchQuery]);

  const matchesSearch = useMemo(() => {
    if (!searchQuery.trim()) return true;
    
    const normalizedQuery = normalizeText(searchQuery);
    const queryWords = normalizedQuery.split(/\s+/).filter((word) => word.length > 0);
    
    if (queryWords.length === 0) return true;
    
    const normalizedTitle = normalizeText(item.title);
    const titleWords = normalizedTitle.split(/\s+/).filter((word) => word.length > 0);
    
    const titleMatch = queryWords.every((queryWord) =>
      titleWords.some((titleWord) => titleWord.includes(queryWord))
    );
    
    if (titleMatch) return true;
    
    const childrenMatch = item.children?.some((child) => childMatchesSearch(child.title));
    
    return childrenMatch || false;
  }, [item, searchQuery, childMatchesSearch]);

  useEffect(() => {
    if (isChildActive && hasChildren && !isExpanded && !lastActiveRef.current) {
      lastActiveRef.current = true;
      onToggleRef.current(itemKey);
    } else if (!isChildActive) {
      lastActiveRef.current = false;
    }
  }, [isChildActive, hasChildren, itemKey, isExpanded]);

  useEffect(() => {
    const searchChanged = lastSearchRef.current !== searchQuery;
    lastSearchRef.current = searchQuery;

    if (searchQuery.trim() && matchesSearch && hasChildren && !isExpanded && searchChanged) {
      onToggleRef.current(itemKey);
    }
  }, [searchQuery, matchesSearch, hasChildren, itemKey, isExpanded]);

  if (!matchesSearch) {
    return <></>;
  }

  const handleIconClick = (e: React.MouseEvent): void => {
    if (!isSidebarOpen) {
      e.preventDefault();
      e.stopPropagation();
      setSidebarOpen(true);
      if (hasChildren) {
        onToggleRef.current(itemKey);
      }
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
              onToggleRef.current(itemKey);
            } else {
              if (isExpanded) {
                onToggle('');
              } else {
                onToggle(itemKey);
              }
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
              
              if (!childMatchesSearch(child.title)) return null;
              
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
  const { t } = useTranslation();
  const { isSidebarOpen } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItemKey, setExpandedItemKey] = useState<string | null>(null);

  const handleToggle = useCallback((key: string): void => {
    setExpandedItemKey((prev) => {
      if (prev === key) {
        return null;
      }
      return key;
    });
  }, []);

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
          {isSidebarOpen && (
            <div className="mb-3">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t('sidebar.search', 'Ara...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn('h-9', searchQuery ? 'pl-8 pr-8' : 'pl-8')}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Temizle"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}
          {items.map((item, index) => (
            <NavItemComponent
              key={item.href || item.title || index}
              item={item}
              searchQuery={searchQuery}
              expandedItemKey={expandedItemKey}
              onToggle={handleToggle}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}

