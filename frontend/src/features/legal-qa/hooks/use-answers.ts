'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { answersApi } from '../services/answers-api';
import type { CreateAnswerInput, UpdateAnswerInput } from '../types';

export function useAnswers(postId: string) {
  return useQuery({
    queryKey: ['answers', postId],
    queryFn: () => answersApi.getAnswers(postId),
    enabled: !!postId,
  });
}

export function useCreateAnswer(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAnswerInput) => answersApi.createAnswer(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['answers', postId] });
    },
  });
}

export function useUpdateAnswer(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ answerId, data }: { answerId: string; data: UpdateAnswerInput }) =>
      answersApi.updateAnswer(postId, answerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['answers', postId] });
    },
  });
}

export function useDeleteAnswer(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (answerId: string) => answersApi.deleteAnswer(postId, answerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['answers', postId] });
    },
  });
}

export function useSelectBestAnswer(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (answerId: string) => answersApi.selectBestAnswer(postId, answerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['answers', postId] });
    },
  });
}
