import { z } from 'zod';
import type { PaginatedResponse } from '@/lib/api-client';

export interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  profileImage: string | null;
  jobType: string | null;
  career: number | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export const JOB_TYPE_LABELS: Record<string, string> = {
  SPECIAL_EDUCATION: '특수교사',
  DAYCARE_TEACHER: '보육교사',
  KINDERGARTEN: '유치원교사',
  CARE_TEACHER: '돌봄교사',
  STUDENT: '학생',
  DIRECTOR: '원장/센터장',
  LAWYER: '법률 자문 변호사',
  OTHER: '기타',
};

export const updateProfileSchema = z.object({
  nickname: z.string().min(2, '닉네임은 2자 이상이어야 합니다').max(20, '닉네임은 20자 이하여야 합니다'),
  jobType: z.string().optional(),
  career: z.number().min(0).max(50).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요'),
  newPassword: z.string().min(8, '새 비밀번호는 8자 이상이어야 합니다'),
  confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// 내가 쓴 글 타입
export interface MyPost {
  id: string;
  title: string;
  content: string;
  category: string;
  isAnonymous: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export type MyPostsResponse = PaginatedResponse<MyPost>;

// 내가 쓴 댓글 타입
export interface MyComment {
  id: string;
  content: string;
  createdAt: string;
  post: {
    id: string;
    title: string;
    category: string;
  };
}

export type MyCommentsResponse = PaginatedResponse<MyComment>;

// 내 북마크 타입
export interface MyBookmark {
  id: string;
  title: string;
  content: string;
  category: string;
  isAnonymous: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  bookmarkedAt: string;
  author?: {
    id: string;
    nickname: string;
    jobType: string | null;
    career: number | null;
    isVerified: boolean;
  };
}

export type MyBookmarksResponse = PaginatedResponse<MyBookmark>;

// 내가 좋아요한 글 타입
export interface MyLike {
  id: string;
  title: string;
  content: string;
  category: string;
  isAnonymous: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  likedAt: string;
  author?: {
    id: string;
    nickname: string;
    jobType: string | null;
    career: number | null;
    isVerified: boolean;
  };
}

export type MyLikesResponse = PaginatedResponse<MyLike>;

// 대시보드 통계 타입
export interface DashboardStats {
  postCount: number;
  commentCount: number;
  receivedLikeCount: number;
  bookmarkCount: number;
}

// 최근 활동 타입
export interface RecentActivity {
  recentPosts: {
    id: string;
    title: string;
    category: string;
    createdAt: string;
    likeCount: number;
    commentCount: number;
  }[];
  recentComments: {
    id: string;
    content: string;
    createdAt: string;
    post: {
      id: string;
      title: string;
    };
  }[];
}
