export interface Answer {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  author: {
    id: string;
    nickname: string;
    isExpert: boolean;
    expertType: 'LAWYER' | 'LEGAL_CONSULTANT' | null;
    profileImage: string | null;
  };
  isBest: boolean;
  bestSelectedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnswerInput {
  content: string;
}

export interface UpdateAnswerInput {
  content?: string;
}

export const EXPERT_TYPE_LABELS: Record<string, string> = {
  LAWYER: '변호사',
  LEGAL_CONSULTANT: '법률 상담사',
};
