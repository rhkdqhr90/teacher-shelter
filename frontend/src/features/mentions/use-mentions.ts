'use client';

import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/use-debounce';
import { searchUsers } from './mentions-api';

export function useUserSearch(query: string, enabled = true) {
  const debouncedQuery = useDebounce(query, 200);

  return useQuery({
    queryKey: ['users', 'search', debouncedQuery],
    queryFn: () => searchUsers(debouncedQuery),
    enabled: enabled && debouncedQuery.length >= 1,
    staleTime: 30 * 1000, // 30초
    gcTime: 5 * 60 * 1000, // 5분
  });
}
