import { api } from '@/lib/api-client';
import type {
  Application,
  CreateApplicationInput,
  UpdateApplicationStatusInput,
} from '../types';

export const applicationsApi = {
  // 지원하기
  create: async (data: CreateApplicationInput): Promise<Application> => {
    const response = await api.post<Application>('/applications', data);
    return response.data;
  },

  // 내 지원 현황 조회
  getMyApplications: async (): Promise<Application[]> => {
    const response = await api.get<Application[]>('/applications/my');
    return response.data;
  },

  // 지원자 목록 조회 (채용담당자용)
  getByPost: async (postId: string): Promise<Application[]> => {
    const response = await api.get<Application[]>(`/applications/post/${postId}`);
    return response.data;
  },

  // 지원 여부 확인
  checkApplied: async (postId: string): Promise<{ applied: boolean }> => {
    const response = await api.get<{ applied: boolean }>(`/applications/post/${postId}/check`);
    return response.data;
  },

  // 지원 상세 조회
  getOne: async (id: string): Promise<Application> => {
    const response = await api.get<Application>(`/applications/${id}`);
    return response.data;
  },

  // 지원 상태 변경 (채용담당자용)
  updateStatus: async (id: string, data: UpdateApplicationStatusInput): Promise<Application> => {
    const response = await api.patch<Application>(`/applications/${id}/status`, data);
    return response.data;
  },

  // 지원 취소
  cancel: async (id: string): Promise<void> => {
    await api.delete(`/applications/${id}`);
  },

  // 이력서 다운로드 URL 가져오기 (채용담당자용)
  getResumeDownloadUrl: (id: string): string => {
    return `/applications/${id}/resume`;
  },

  // 이력서 다운로드 (채용담당자용)
  downloadResume: async (id: string, fileName: string): Promise<void> => {
    const response = await api.get(`/applications/${id}/resume`, {
      responseType: 'blob',
    });

    // Blob으로 다운로드 처리
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
