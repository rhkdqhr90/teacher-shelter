import { api } from '@/lib/api-client';
import type { UpdateProfileInput, UserProfile, MyPostsResponse, MyCommentsResponse, MyBookmarksResponse, MyLikesResponse, DashboardStats, RecentActivity } from '../types';

export const profileApi = {
  // 내 프로필 조회
  async getProfile(): Promise<UserProfile> {
    const response = await api.get<UserProfile>('/users/me');
    return response.data;
  },

  // 프로필 수정
  async updateProfile(data: UpdateProfileInput): Promise<UserProfile> {
    const response = await api.patch<UserProfile>('/users/me', data);
    return response.data;
  },

  // 비밀번호 변경
  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    await api.patch('/users/me/password', data);
  },

  // 회원 탈퇴
  async deleteAccount(password: string): Promise<void> {
    await api.delete('/users/me', { data: { password } });
  },

  // 내가 쓴 글 조회
  async getMyPosts(page = 1, limit = 20): Promise<MyPostsResponse> {
    const response = await api.get<MyPostsResponse>(`/users/me/posts?page=${page}&limit=${limit}`);
    return response.data;
  },

  // 내가 쓴 댓글 조회
  async getMyComments(page = 1, limit = 20): Promise<MyCommentsResponse> {
    const response = await api.get<MyCommentsResponse>(`/users/me/comments?page=${page}&limit=${limit}`);
    return response.data;
  },

  // 내 북마크 조회
  async getMyBookmarks(page = 1, limit = 20): Promise<MyBookmarksResponse> {
    const response = await api.get<MyBookmarksResponse>(`/users/me/bookmarks?page=${page}&limit=${limit}`);
    return response.data;
  },

  // 내가 좋아요한 글 조회
  async getMyLikes(page = 1, limit = 20): Promise<MyLikesResponse> {
    const response = await api.get<MyLikesResponse>(`/users/me/likes?page=${page}&limit=${limit}`);
    return response.data;
  },

  // 대시보드 통계 조회
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/users/me/dashboard-stats');
    return response.data;
  },

  // 최근 활동 조회
  async getRecentActivity(limit = 5): Promise<RecentActivity> {
    const response = await api.get<RecentActivity>(`/users/me/recent-activity?limit=${limit}`);
    return response.data;
  },
};
