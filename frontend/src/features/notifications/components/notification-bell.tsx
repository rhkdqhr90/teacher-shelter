'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useUnreadCount } from '../hooks/use-notifications';

export function NotificationBell() {
  const { data } = useUnreadCount();
  const unreadCount = data?.count ?? 0;

  const ariaLabel = unreadCount > 0
    ? `알림 ${unreadCount > 99 ? '99개 이상' : `${unreadCount}개`} 읽지 않음`
    : '알림';

  return (
    <Link
      href="/notifications"
      className="p-2 -mr-2 hover:bg-muted rounded-lg relative"
      aria-label={ariaLabel}
    >
      <Bell className="h-5 w-5" aria-hidden="true" />
      {unreadCount > 0 && (
        <span
          className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] px-1 bg-destructive text-destructive-foreground text-[10px] font-medium rounded-full flex items-center justify-center"
          aria-hidden="true"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
