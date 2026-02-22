import { useQuery } from '@tanstack/react-query';
import { queryKeys, CACHE_TIME } from '@/lib/query-config';
import { announcementsApi } from '../services/announcements-api';

// 전체 공지사항 목록
export function useAnnouncements() {
  return useQuery({
    queryKey: queryKeys.announcements.list(),
    queryFn: () => announcementsApi.getAll(),
    staleTime: CACHE_TIME.ANNOUNCEMENTS,
  });
}

// 홈 미리보기용 (최신 N개)
export function useLatestAnnouncements(limit = 3) {
  return useQuery({
    queryKey: queryKeys.announcements.latest(limit),
    queryFn: () => announcementsApi.getLatest(limit),
    staleTime: CACHE_TIME.ANNOUNCEMENTS,
  });
}

// 고정 공지만 (배너용)
export function usePinnedAnnouncements() {
  return useQuery({
    queryKey: queryKeys.announcements.pinned(),
    queryFn: () => announcementsApi.getPinned(),
    staleTime: CACHE_TIME.ANNOUNCEMENTS,
  });
}

// 공지사항 상세
export function useAnnouncement(id: string) {
  return useQuery({
    queryKey: queryKeys.announcements.detail(id),
    queryFn: () => announcementsApi.getById(id),
    staleTime: CACHE_TIME.ANNOUNCEMENTS,
    enabled: !!id,
  });
}
