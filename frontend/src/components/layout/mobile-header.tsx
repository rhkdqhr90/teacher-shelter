'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useIsAuthenticated } from '@/stores/auth-store';
import { NotificationBell } from '@/features/notifications/components/notification-bell';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export function MobileHeader({ title = '교사쉼터' }: MobileHeaderProps) {
  const { setSidebarOpen } = useAppStore();
  const isAuthenticated = useIsAuthenticated();

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border lg:hidden">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left: Menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 hover:bg-muted rounded-lg"
          aria-label="메뉴 열기"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Center: Title/Logo */}
        <Link href="/" className="text-lg font-bold text-primary">
          {title}
        </Link>

        {/* Right: Theme + Auth */}
        <div className="flex items-center gap-0.5">
          <ThemeToggle className="p-2" />
          {isAuthenticated ? (
            <NotificationBell />
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-primary hover:underline ml-1"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
