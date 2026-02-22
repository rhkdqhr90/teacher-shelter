import { api } from '@/lib/api-client';
import type { Banner } from '../types';

export const bannerApi = {
  // 활성 프로모션 배너 조회 (홈 캐러셀용)
  getPromoBanners: async (): Promise<Banner[]> => {
    const response = await api.get<Banner[]>('/banners/promo');
    return response.data;
  },

  // 활성 사이드바 배너 조회 (광고용)
  getSidebarBanners: async (): Promise<Banner[]> => {
    const response = await api.get<Banner[]>('/banners/sidebar');
    return response.data;
  },
};
