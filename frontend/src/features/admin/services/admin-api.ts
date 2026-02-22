import { api, type PaginatedResponse } from '@/lib/api-client';

// Types
export interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  pendingReports: number;
  pendingVerifications: number;
  todayUsers: number;
  todayPosts: number;
}

export interface AdminUser {
  id: string;
  email: string;
  nickname: string;
  role: 'USER' | 'ADMIN';
  isVerified: boolean;
  jobType?: string;
  career?: number;
  provider?: string;
  createdAt: string;
  lastLoginAt?: string;
  _count: {
    posts: number;
    comments: number;
    reportsReceived: number;
  };
}

export interface AdminPost {
  id: string;
  title: string;
  category: string;
  isAnonymous: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  author?: { id: string; nickname: string; email: string };
  _count: { reports: number };
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  isPublished: boolean;
  authorId?: string;
  createdAt: string;
  updatedAt: string;
}

export type BannerType = 'PROMO' | 'SIDEBAR';

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  alt: string;
  type: BannerType;
  isActive: boolean;
  priority: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type InquiryType = 'GENERAL' | 'ACCOUNT' | 'REPORT' | 'SUGGESTION' | 'PARTNERSHIP' | 'OTHER';
export type InquiryStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface Inquiry {
  id: string;
  type: InquiryType;
  email: string;
  subject: string;
  content: string;
  status: InquiryStatus;
  response?: string;
  userId?: string;
  user?: { id: string; nickname: string; email: string };
  respondedBy?: { id: string; nickname: string };
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReportAction =
  | 'NONE'
  | 'WARNING'
  | 'POST_DELETE'
  | 'COMMENT_DELETE'
  | 'USER_BAN_1DAY'
  | 'USER_BAN_7DAYS'
  | 'USER_BAN_30DAYS'
  | 'USER_BAN_PERMANENT';

export interface Report {
  id: string;
  type: 'POST' | 'COMMENT' | 'USER';
  reason: string;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';
  action?: ReportAction;
  createdAt: string;
  targetPostId?: string;
  targetCommentId?: string;
  targetUserId?: string;
  reporter: { id: string; nickname: string; email?: string };
  targetUser?: { id: string; nickname: string; email?: string };
  targetPost?: { id: string; title: string; authorId?: string };
  targetComment?: { id: string; content: string; authorId?: string; postId?: string };
  processedBy?: { id: string; nickname: string };
  processedAt?: string;
  processingNote?: string;
}

// API functions
export const adminApi = {
  // 대시보드 통계
  async getStats(): Promise<AdminStats> {
    const response = await api.get<AdminStats>('/admin/stats');
    return response.data;
  },

  // 신고 관리
  async getReports(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  }): Promise<PaginatedResponse<Report>> {
    const response = await api.get<PaginatedResponse<Report>>('/admin/reports', { params });
    return response.data;
  },

  async getReport(id: string): Promise<Report> {
    const response = await api.get<Report>(`/admin/reports/${id}`);
    return response.data;
  },

  async processReport(id: string, data: { status?: string; processingNote?: string; action?: ReportAction }): Promise<Report> {
    const response = await api.patch<Report>(`/admin/reports/${id}`, data);
    return response.data;
  },

  // 사용자 관리
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<PaginatedResponse<AdminUser>> {
    const response = await api.get<PaginatedResponse<AdminUser>>('/admin/users', { params });
    return response.data;
  },

  async updateUserRole(id: string, role: 'USER' | 'ADMIN'): Promise<AdminUser> {
    const response = await api.patch<AdminUser>(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/admin/users/${id}`);
  },

  // 게시글 관리
  async getPosts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
  }): Promise<PaginatedResponse<AdminPost>> {
    const response = await api.get<PaginatedResponse<AdminPost>>('/admin/posts', { params });
    return response.data;
  },

  async deletePost(id: string): Promise<void> {
    await api.delete(`/admin/posts/${id}`);
  },

  async bulkDeletePosts(ids: string[]): Promise<{ deletedCount: number }> {
    const response = await api.post<{ deletedCount: number }>('/admin/posts/bulk-delete', { ids });
    return response.data;
  },

  // 댓글 관리
  async deleteComment(id: string): Promise<void> {
    await api.delete(`/admin/comments/${id}`);
  },

  // 공지사항 관리
  async getAnnouncements(): Promise<Announcement[]> {
    const response = await api.get<Announcement[]>('/announcements/admin/all');
    return response.data;
  },

  async createAnnouncement(data: {
    title: string;
    content: string;
    isPinned?: boolean;
    isPublished?: boolean;
  }): Promise<Announcement> {
    const response = await api.post<Announcement>('/announcements', data);
    return response.data;
  },

  async updateAnnouncement(
    id: string,
    data: Partial<{ title: string; content: string; isPinned: boolean; isPublished: boolean }>
  ): Promise<Announcement> {
    const response = await api.patch<Announcement>(`/announcements/${id}`, data);
    return response.data;
  },

  async deleteAnnouncement(id: string): Promise<void> {
    await api.delete(`/announcements/${id}`);
  },

  async toggleAnnouncementPin(id: string): Promise<Announcement> {
    const response = await api.patch<Announcement>(`/announcements/${id}/pin`);
    return response.data;
  },

  async toggleAnnouncementPublish(id: string): Promise<Announcement> {
    const response = await api.patch<Announcement>(`/announcements/${id}/publish`);
    return response.data;
  },

  // 배너 관리
  async getBanners(type?: BannerType): Promise<Banner[]> {
    const response = await api.get<Banner[]>('/banners/admin/all', { params: type ? { type } : {} });
    return response.data;
  },

  async createBanner(data: {
    title: string;
    imageUrl: string;
    linkUrl?: string;
    alt: string;
    type?: BannerType;
    isActive?: boolean;
    priority?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<Banner> {
    const response = await api.post<Banner>('/banners', data);
    return response.data;
  },

  async updateBanner(
    id: string,
    data: Partial<{
      title: string;
      imageUrl: string;
      linkUrl: string;
      alt: string;
      type: BannerType;
      isActive: boolean;
      priority: number;
      startDate: string;
      endDate: string;
    }>
  ): Promise<Banner> {
    const response = await api.patch<Banner>(`/banners/${id}`, data);
    return response.data;
  },

  async deleteBanner(id: string): Promise<void> {
    await api.delete(`/banners/${id}`);
  },

  async toggleBannerActive(id: string): Promise<Banner> {
    const response = await api.patch<Banner>(`/banners/${id}/toggle`);
    return response.data;
  },

  // 문의 관리
  async getInquiries(params?: {
    page?: number;
    limit?: number;
    status?: InquiryStatus;
  }): Promise<PaginatedResponse<Inquiry>> {
    const response = await api.get<PaginatedResponse<Inquiry>>('/inquiries', { params });
    return response.data;
  },

  async getInquiry(id: string): Promise<Inquiry> {
    const response = await api.get<Inquiry>(`/inquiries/${id}`);
    return response.data;
  },

  async respondInquiry(id: string, response: string): Promise<Inquiry> {
    const res = await api.patch<Inquiry>(`/inquiries/${id}/respond`, { response });
    return res.data;
  },

  async updateInquiryStatus(id: string, status: InquiryStatus): Promise<Inquiry> {
    const response = await api.patch<Inquiry>(`/inquiries/${id}/status`, { status });
    return response.data;
  },
};
