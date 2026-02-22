'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../services/profile-api';
import type { UpdateProfileInput } from '../types';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.getProfile(),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileInput) => profileApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      profileApi.changePassword(data),
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: (password: string) => profileApi.deleteAccount(password),
  });
}

export function useMyPosts(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['myPosts', page, limit],
    queryFn: () => profileApi.getMyPosts(page, limit),
  });
}

export function useMyComments(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['myComments', page, limit],
    queryFn: () => profileApi.getMyComments(page, limit),
  });
}

export function useMyBookmarks(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['bookmarks', page, limit],
    queryFn: () => profileApi.getMyBookmarks(page, limit),
  });
}

export function useMyLikes(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['myLikes', page, limit],
    queryFn: () => profileApi.getMyLikes(page, limit),
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => profileApi.getDashboardStats(),
  });
}

export function useRecentActivity(limit = 5) {
  return useQuery({
    queryKey: ['recentActivity', limit],
    queryFn: () => profileApi.getRecentActivity(limit),
  });
}
