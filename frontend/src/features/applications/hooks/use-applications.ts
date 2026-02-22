import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsApi } from '../services/applications-api';
import type {
  CreateApplicationInput,
  UpdateApplicationStatusInput,
} from '../types';

export const applicationKeys = {
  all: ['applications'] as const,
  my: () => [...applicationKeys.all, 'my'] as const,
  byPost: (postId: string) => [...applicationKeys.all, 'post', postId] as const,
  check: (postId: string) => [...applicationKeys.all, 'check', postId] as const,
  detail: (id: string) => [...applicationKeys.all, 'detail', id] as const,
};

// 내 지원 현황
export function useMyApplications() {
  return useQuery({
    queryKey: applicationKeys.my(),
    queryFn: () => applicationsApi.getMyApplications(),
  });
}

// 지원자 목록 (채용담당자)
export function useApplicationsByPost(postId: string) {
  return useQuery({
    queryKey: applicationKeys.byPost(postId),
    queryFn: () => applicationsApi.getByPost(postId),
    enabled: !!postId,
  });
}

// 지원 여부 확인
export function useCheckApplied(postId: string, enabled = true) {
  return useQuery({
    queryKey: applicationKeys.check(postId),
    queryFn: () => applicationsApi.checkApplied(postId),
    enabled: !!postId && enabled,
  });
}

// 지원 상세
export function useApplication(id: string) {
  return useQuery({
    queryKey: applicationKeys.detail(id),
    queryFn: () => applicationsApi.getOne(id),
    enabled: !!id,
  });
}

// 지원하기
export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateApplicationInput) => applicationsApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.my() });
      queryClient.invalidateQueries({ queryKey: applicationKeys.check(variables.postId) });
    },
  });
}

// 지원 상태 변경
export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateApplicationStatusInput }) =>
      applicationsApi.updateStatus(id, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.byPost(result.postId) });
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(result.id) });
    },
  });
}

// 지원 취소
export function useCancelApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => applicationsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.my() });
    },
  });
}
