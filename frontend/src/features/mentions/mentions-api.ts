import { api } from '@/lib/api-client';
import type { MentionUser } from './types';

export async function searchUsers(query: string, limit = 10): Promise<MentionUser[]> {
  const response = await api.get<MentionUser[]>('/users/search', {
    params: { q: query, limit },
  });
  return response.data;
}
