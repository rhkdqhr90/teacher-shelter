import { api } from '@/lib/api-client';
import type { InquiriesResponse } from '../types';

export const inquiriesApi = {
  /**
   * 내 문의 목록 조회
   */
  getMyInquiries: async (page = 1, limit = 20): Promise<InquiriesResponse> => {
    const response = await api.get<InquiriesResponse>(
      `/inquiries/my?page=${page}&limit=${limit}`
    );
    return response.data;
  },
};
