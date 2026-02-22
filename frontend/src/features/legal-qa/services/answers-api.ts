import { api } from '@/lib/api-client';
import type { Answer, CreateAnswerInput, UpdateAnswerInput } from '../types';

export const answersApi = {
  // 답변 목록 조회
  async getAnswers(postId: string): Promise<Answer[]> {
    const response = await api.get<Answer[]>(`/posts/${postId}/answers`);
    return response.data;
  },

  // 답변 작성
  async createAnswer(postId: string, data: CreateAnswerInput): Promise<Answer> {
    const response = await api.post<Answer>(`/posts/${postId}/answers`, data);
    return response.data;
  },

  // 답변 수정
  async updateAnswer(postId: string, answerId: string, data: UpdateAnswerInput): Promise<Answer> {
    const response = await api.patch<Answer>(`/posts/${postId}/answers/${answerId}`, data);
    return response.data;
  },

  // 답변 삭제
  async deleteAnswer(postId: string, answerId: string): Promise<void> {
    await api.delete(`/posts/${postId}/answers/${answerId}`);
  },

  // 베스트 답변 선택
  async selectBestAnswer(postId: string, answerId: string): Promise<Answer> {
    const response = await api.patch<Answer>(`/posts/${postId}/answers/${answerId}/best`);
    return response.data;
  },
};
