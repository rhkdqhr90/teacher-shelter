import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reportsApi } from '../services/reports-api';
import type { CreateReportInput, ReportsResponse } from '../types';
import { useToast } from '@/hooks/use-toast';

export const reportKeys = {
  all: ['reports'] as const,
  myReports: (page: number) => [...reportKeys.all, 'my', page] as const,
};

/**
 * 내 신고 목록 조회
 */
export function useMyReports(page = 1, limit = 20) {
  return useQuery<ReportsResponse>({
    queryKey: reportKeys.myReports(page),
    queryFn: () => reportsApi.getMyReports(page, limit),
  });
}

/**
 * 신고 생성
 */
export function useCreateReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateReportInput) => reportsApi.createReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
      toast.success('신고가 접수되었습니다', '관리자가 검토 후 처리할 예정입니다.');
    },
    onError: (error: Error) => {
      const message = error.message || '신고 접수에 실패했습니다.';
      toast.error('신고 실패', message);
    },
  });
}
