export type InquiryType =
  | 'GENERAL'
  | 'ACCOUNT'
  | 'REPORT'
  | 'SUGGESTION'
  | 'PARTNERSHIP'
  | 'OTHER';

export type InquiryStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface Inquiry {
  id: string;
  type: InquiryType;
  subject: string;
  content: string;
  status: InquiryStatus;
  response: string | null;
  respondedAt: string | null;
  createdAt: string;
}

export interface InquiriesResponse {
  data: Inquiry[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const INQUIRY_TYPE_LABELS: Record<InquiryType, string> = {
  GENERAL: '일반 문의',
  ACCOUNT: '계정 관련',
  REPORT: '신고/불편 사항',
  SUGGESTION: '서비스 제안',
  PARTNERSHIP: '제휴/협력 문의',
  OTHER: '기타',
};

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  PENDING: '대기 중',
  IN_PROGRESS: '처리 중',
  RESOLVED: '답변 완료',
  CLOSED: '종료',
};
