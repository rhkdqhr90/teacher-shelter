import { api, type PaginatedResponse, type PaginationMeta } from '@/lib/api-client';

export type NotificationType =
  | 'COMMENT'
  | 'REPLY'
  | 'LIKE'
  | 'MENTION'
  | 'NEW_APPLICATION'
  | 'APPLICATION_STATUS'
  | 'VERIFICATION_APPROVED'
  | 'VERIFICATION_REJECTED';

export interface Notification {
  id: string;
  type: NotificationType;
  actor: {
    id: string;
    nickname: string;
  } | null;
  post: {
    id: string;
    title: string;
  } | null;
  commentId: string | null;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsMeta extends PaginationMeta {
  unreadCount: number;
}

interface NotificationsResponse extends Omit<PaginatedResponse<Notification>, 'meta'> {
  meta: NotificationsMeta;
}

export const notificationsApi = {
  async getNotifications(page = 1, limit = 20): Promise<NotificationsResponse> {
    // _isBackground: 401 발생 시 refresh 시도 없이 조용히 실패
    // (폴링/리페치로 인한 연쇄 refresh → clearAuth 강제 로그아웃 방지)
    const response = await api.get<NotificationsResponse>('/notifications', {
      params: { page, limit },
      _isBackground: true,
    } as Parameters<typeof api.get>[1]);
    return response.data;
  },

  async getUnreadCount(): Promise<{ count: number }> {
    // _isBackground: 백그라운드 polling 요청 표시
    // 401 발생 시 refresh 시도 없이 조용히 실패 (UI 깜빡임 방지)
    const response = await api.get<{ count: number }>('/notifications/unread-count', {
      _isBackground: true,
    } as Parameters<typeof api.get>[1]);
    return response.data;
  },

  async markAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  },

  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },
};
