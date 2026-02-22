import { api, type PaginatedResponse } from '@/lib/api-client';

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    nickname: string;
    jobType?: string;
    career?: number;
    isVerified: boolean;
  };
  mentionedUser?: {
    id: string;
    nickname: string;
  };
  parentCommentId: string | null;
  replies: Comment[];
  createdAt: string;
  updatedAt: string;
}

type CommentsResponse = PaginatedResponse<Comment>;

export const commentsApi = {
  async getComments(postId: string): Promise<CommentsResponse> {
    const response = await api.get<CommentsResponse>(`/posts/${postId}/comments`);
    return response.data;
  },

  async createComment(
    postId: string,
    data: { content: string; parentCommentId?: string; mentionedUserId?: string }
  ): Promise<Comment> {
    const response = await api.post<Comment>(`/posts/${postId}/comments`, data);
    return response.data;
  },

  async updateComment(commentId: string, content: string): Promise<Comment> {
    const response = await api.patch<Comment>(`/comments/${commentId}`, { content });
    return response.data;
  },

  async deleteComment(commentId: string): Promise<void> {
    await api.delete(`/comments/${commentId}`);
  },
};
