'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PenSquare, Search, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  matchPaths?: string[];
}

const navItems: NavItem[] = [
  {
    href: '/',
    icon: <Home className="h-6 w-6" />,
    label: '홈',
    matchPaths: ['/', '/posts'],
  },
  {
    href: '/posts/new',
    icon: <PenSquare className="h-6 w-6" />,
    label: '글쓰기',
  },
  {
    href: '/search',
    icon: <Search className="h-6 w-6" />,
    label: '검색',
  },
  {
    href: '/dashboard',
    icon: <LayoutDashboard className="h-6 w-6" />,
    label: 'MY',
    matchPaths: ['/dashboard', '/profile', '/settings'],
  },
];

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (item: NavItem) => {
    if (item.matchPaths) {
      return item.matchPaths.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`)
      );
    }
    return pathname === item.href;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border lg:hidden">
      <div className="flex items-center justify-around h-16 px-2 pb-safe">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center min-w-[64px] h-full gap-1 transition-colors',
                active
                  ? 'text-primary'
                  : 'text-foreground-muted hover:text-foreground'
              )}
            >
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
