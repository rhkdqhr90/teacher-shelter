import { useQuery } from '@tanstack/react-query';
import { inquiriesApi } from '../services/inquiries-api';
import type { InquiriesResponse } from '../types';

export const inquiryKeys = {
  all: ['inquiries'] as const,
  myInquiries: (page: number) => [...inquiryKeys.all, 'my', page] as const,
};

/**
 * 내 문의 목록 조회
 */
export function useMyInquiries(page = 1, limit = 20) {
  return useQuery<InquiriesResponse>({
    queryKey: inquiryKeys.myInquiries(page),
    queryFn: () => inquiriesApi.getMyInquiries(page, limit),
  });
}
