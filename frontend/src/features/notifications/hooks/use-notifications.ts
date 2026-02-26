'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { CACHE_TIME, queryKeys } from '@/lib/query-config';
import { useIsAuthenticated } from '@/stores/auth-store';
import { notificationsApi } from '../notifications-api';

// 알림 목록 조회 (무한스크롤)
export function useNotifications() {
  const isAuthenticated = useIsAuthenticated();

  return useInfiniteQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: ({ pageParam = 1 }) => notificationsApi.getNotifications(pageParam, 20),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: isAuthenticated,
    staleTime: CACHE_TIME.NOTIFICATIONS,
  });
}

// 읽지 않은 알림 개수
export function useUnreadCount() {
  const isAuthenticated = useIsAuthenticated();

  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: isAuthenticated ? 30000 : false,
    refetchIntervalInBackground: false,
    staleTime: CACHE_TIME.UNREAD_COUNT,
    enabled: isAuthenticated,
  });
}

// 알림 읽음 처리
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

// 모든 알림 읽음 처리
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

// 알림 삭제
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}
