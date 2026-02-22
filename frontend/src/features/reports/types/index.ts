import type { PaginatedResponse } from '@/lib/api-client';

export type ReportType = 'POST' | 'COMMENT' | 'USER';
export type ReportStatus = 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';

export interface Report {
  id: string;
  type: ReportType;
  reason: string;
  status: ReportStatus;
  reporterId: string;
  targetUserId?: string;
  targetPostId?: string;
  targetCommentId?: string;
  processedById?: string;
  processedAt?: string;
  processingNote?: string;
  createdAt: string;
  updatedAt: string;
  reporter?: {
    id: string;
    nickname: string;
  };
  targetUser?: {
    id: string;
    nickname: string;
    email: string;
  };
  targetPost?: {
    id: string;
    title: string;
  };
  targetComment?: {
    id: string;
    content: string;
  };
  processedBy?: {
    id: string;
    nickname: string;
  };
}

export interface CreateReportInput {
  type: ReportType;
  reason: string;
  targetUserId?: string;
  targetPostId?: string;
  targetCommentId?: string;
}

export type ReportsResponse = PaginatedResponse<Report>;

export const REPORT_REASONS = [
  { value: 'spam', label: '스팸/광고' },
  { value: 'inappropriate', label: '부적절한 내용' },
  { value: 'harassment', label: '괴롭힘/욕설' },
  { value: 'misinformation', label: '허위 정보' },
  { value: 'copyright', label: '저작권 침해' },
  { value: 'other', label: '기타' },
] as const;

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  PENDING: '대기 중',
  REVIEWED: '검토 완료',
  RESOLVED: '처리 완료',
  DISMISSED: '기각',
};

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  POST: '게시글',
  COMMENT: '댓글',
  USER: '사용자',
};
