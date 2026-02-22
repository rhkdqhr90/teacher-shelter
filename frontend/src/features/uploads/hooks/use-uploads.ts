'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadsApi } from '../uploads-api';

export function useUploadProfileImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadsApi.uploadProfileImage(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}

export function useDeleteProfileImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => uploadsApi.deleteProfileImage(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}

export function useUploadPostImage() {
  return useMutation({
    mutationFn: (file: File) => uploadsApi.uploadPostImage(file),
  });
}
