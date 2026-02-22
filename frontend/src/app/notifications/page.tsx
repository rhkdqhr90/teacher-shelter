'use client';

import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, Loader2, ArrowLeft } from 'lucide-react';
import { useNotifications, useUnreadCount, useMarkAllAsRead } from '@/features/notifications/hooks/use-notifications';
import { NotificationItem } from '@/features/notifications/components/notification-item';
import { useIsAuthenticated, useUser } from '@/stores/auth-store';
import { useEffect } from 'react';
import { MainLayout } from '@/components/layout';

export default function NotificationsPage() {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();
  const { data: unreadData } = useUnreadCount();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useNotifications();
  const markAllAsRead = useMarkAllAsRead();

  const unreadCount = unreadData?.count ?? 0;
  const notifications = data?.pages.flatMap((page) => page.data) ?? [];

  // Redirect to alogin if not authenticated, or to register if not verified
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user && !user.isVerified) {
      router.push('/register');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || (user && !user.isVerified)) {
    return null;
  }

  return (
    <MainLayout showSidebar={false}>
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-muted rounded-lg lg:hidden"
            aria-label="뒤로가기"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">알림</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-sm font-medium rounded-full">
              {unreadCount}개 읽지 않음
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" />
            모두 읽음
          </button>
        )}
      </div>

      {/* Notifications list */}
      <div className="bg-background border border-border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-foreground-muted" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 text-foreground-muted">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium mb-1">알림이 없습니다</p>
            <p className="text-sm">새로운 댓글이나 좋아요가 있으면 여기에 표시됩니다.</p>
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full py-4 text-sm text-primary hover:bg-muted/50 disabled:opacity-50 border-t border-border"
              >
                {isFetchingNextPage ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                ) : (
                  '더 보기'
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
    </MainLayout>
  );
}
