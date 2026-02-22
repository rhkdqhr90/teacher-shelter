import { api } from '@/lib/api-client';
import type { Announcement } from '../types';

export const announcementsApi = {
  // 전체 공지사항 목록 (발행된 것만)
  getAll: async (): Promise<Announcement[]> => {
    const response = await api.get<Announcement[]>('/announcements');
    return response.data;
  },

  // 최신 공지사항 (홈 화면용)
  getLatest: async (limit = 3): Promise<Announcement[]> => {
    const response = await api.get<Announcement[]>('/announcements', {
      params: { limit },
    });
    return response.data.slice(0, limit);
  },

  // 고정 공지사항만
  getPinned: async (): Promise<Announcement[]> => {
    const response = await api.get<Announcement[]>('/announcements');
    return response.data.filter((a: Announcement) => a.isPinned);
  },

  // 공지사항 상세
  getById: async (id: string): Promise<Announcement> => {
    const response = await api.get<Announcement>(`/announcements/${id}`);
    return response.data;
  },
};
