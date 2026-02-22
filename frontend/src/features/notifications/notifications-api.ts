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
    const response = await api.get<NotificationsResponse>('/notifications', {
      params: { page, limit },
    });
    return response.data;
  },

  async getUnreadCount(): Promise<{ count: number }> {
    const response = await api.get<{ count: number }>('/notifications/unread-count');
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
