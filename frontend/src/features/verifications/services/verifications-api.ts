import { api } from '@/lib/api-client';

export interface VerificationRequest {
  id: string;
  userId: string;
  verificationType: string;
  fileUrl: string;
  originalFileName: string;
  fileType: string;
  fileSize: number;
  note?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  processedById?: string;
  processedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    nickname: string;
    isVerified: boolean;
    jobType?: string;
    career?: string;
    createdAt?: string;
  };
  processedBy?: {
    id: string;
    nickname: string;
    email?: string;
  };
}

export interface VerificationStatusResponse {
  hasRequest: boolean;
  latestStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  latestRequest?: VerificationRequest;
}

export interface CreateVerificationData {
  verificationType: string;
  note?: string;
  file: File;
}

// 사용자 API
export const verificationsApi = {
  // 내 인증 요청 목록 조회
  getMyRequests: async (): Promise<VerificationRequest[]> => {
    const response = await api.get('/verifications/my');
    return response.data;
  },

  // 내 최신 인증 상태 조회
  getMyStatus: async (): Promise<VerificationStatusResponse> => {
    const response = await api.get('/verifications/my/status');
    return response.data;
  },

  // 인증 요청 생성
  create: async (data: CreateVerificationData): Promise<VerificationRequest> => {
    const formData = new FormData();
    formData.append('verificationType', data.verificationType);
    if (data.note) {
      formData.append('note', data.note);
    }
    formData.append('file', data.file);

    const response = await api.post('/verifications', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// 관리자 API
export interface VerificationsListResponse {
  data: VerificationRequest[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProcessVerificationData {
  status: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

export const adminVerificationsApi = {
  // 인증 요청 목록 조회
  getList: async (params?: {
    page?: number;
    limit?: number;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  }): Promise<VerificationsListResponse> => {
    const response = await api.get('/admin/verifications', { params });
    return response.data;
  },

  // 인증 요청 상세 조회
  getOne: async (id: string): Promise<VerificationRequest> => {
    const response = await api.get(`/admin/verifications/${id}`);
    return response.data;
  },

  // 인증 요청 처리 (승인/반려)
  process: async (id: string, data: ProcessVerificationData): Promise<VerificationRequest> => {
    const response = await api.patch(`/admin/verifications/${id}`, data);
    return response.data;
  },
};
