import { api } from '@/lib/api-client';
import type { Report, ReportsResponse, CreateReportInput } from '../types';

export const reportsApi = {
  /**
   * 신고 생성
   */
  createReport: async (data: CreateReportInput): Promise<Report> => {
    const response = await api.post<{ data: Report }>('/reports', data);
    return response.data.data;
  },

  /**
   * 내 신고 목록 조회
   */
  getMyReports: async (page = 1, limit = 20): Promise<ReportsResponse> => {
    const response = await api.get<{ data: Report[]; meta: ReportsResponse['meta'] }>(
      `/reports/my?page=${page}&limit=${limit}`
    );
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },
};
