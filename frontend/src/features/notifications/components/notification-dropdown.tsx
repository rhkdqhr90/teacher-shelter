'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useNotifications, useUnreadCount, useMarkAllAsRead } from '../hooks/use-notifications';
import { NotificationItem } from './notification-item';
import { useClickOutside } from '@/hooks/use-click-outside';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: unreadData } = useUnreadCount();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useNotifications();
  const markAllAsRead = useMarkAllAsRead();

  const unreadCount = unreadData?.count ?? 0;
  const notifications = data?.pages.flatMap((page) => page.data) ?? [];

  const closeDropdown = useCallback(() => setIsOpen(false), []);
  useClickOutside(dropdownRef, closeDropdown, isOpen);

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-foreground-muted hover:text-foreground transition-colors relative"
        aria-label="알림"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-destructive text-destructive-foreground text-xs font-medium rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-h-[480px] bg-background border border-border rounded-lg shadow-lg overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="font-semibold text-foreground">알림</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsRead.isPending}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 disabled:opacity-50"
                >
                  <CheckCheck className="h-4 w-4" />
                  모두 읽음
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[380px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="md" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-foreground-muted">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">알림이 없습니다</p>
              </div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <div key={notification.id} onClick={() => setIsOpen(false)}>
                    <NotificationItem notification={notification} />
                  </div>
                ))}
                {hasNextPage && (
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="w-full py-3 text-sm text-primary hover:bg-muted/50 disabled:opacity-50"
                  >
                    {isFetchingNextPage ? (
                      <Spinner size="sm" className="mx-auto" />
                    ) : (
                      '더 보기'
                    )}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="block text-center py-3 text-sm text-primary hover:bg-muted/50"
            >
              모든 알림 보기
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
