'use client';

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CACHE_TIME, queryKeys } from '@/lib/query-config';
import { postsApi } from '../services/posts-api';
import {
  type PostCategory,
  type JobSubCategory,
  type Region,
  type TherapyTag,
  COMMUNITY_CATEGORIES,
  INFO_CATEGORIES,
  TEACHING_LIFE_CATEGORIES,
  type CreatePostInput,
  type UpdatePostInput,
  type Post,
} from '../types';

interface UsePostsOptions {
  page?: number;
  limit?: number;
  category?: PostCategory;
  sort?: 'createdAt' | 'viewCount' | 'likeCount';
  order?: 'asc' | 'desc';
  search?: string;
  // 구인공고 필터
  jobSubCategory?: JobSubCategory;
  region?: Region;
  isRecruiting?: boolean;
  therapyTags?: TherapyTag[];
}

export function usePosts(options: UsePostsOptions = {}) {
  return useQuery({
    queryKey: queryKeys.posts.list(options),
    queryFn: () => postsApi.getPosts(options),
    staleTime: CACHE_TIME.POSTS_LIST,
  });
}

// 무한스크롤용 훅
export function useInfinitePosts(options: Omit<UsePostsOptions, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.infinite(options),
    queryFn: ({ pageParam = 1 }) =>
      postsApi.getPosts({ ...options, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    staleTime: CACHE_TIME.POSTS_LIST,
  });
}

export function usePost(id: string) {
  return useQuery({
    queryKey: queryKeys.posts.detail(id),
    queryFn: () => postsApi.getPost(id),
    enabled: !!id,
    staleTime: CACHE_TIME.POST_DETAIL,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostInput) => postsApi.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePostInput }) =>
      postsApi.updatePost(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(id) });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => postsApi.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => postsApi.toggleLike(id),
    // Optimistic update: toggle like state instantly for responsive UX
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.like(id) });
      const previousLike = queryClient.getQueryData(queryKeys.posts.like(id));
      // Optimistically toggle the like status
      queryClient.setQueryData(queryKeys.posts.like(id), (old: { isLiked: boolean } | undefined) =>
        old ? { ...old, isLiked: !old.isLiked } : old,
      );
      return { previousLike };
    },
    onError: (_err, id, context) => {
      // Rollback on error
      if (context?.previousLike) {
        queryClient.setQueryData(queryKeys.posts.like(id), context.previousLike);
      }
    },
    onSettled: (_, _err, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.like(id) });
    },
  });
}

// 인기글 조회 훅
export function useHotPosts() {
  return useQuery({
    queryKey: queryKeys.posts.hot(),
    queryFn: () => postsApi.getHotPosts(),
    staleTime: CACHE_TIME.HOT_POSTS,
  });
}

// 카테고리별 최신글 (홈 대시보드용)
// 단일 API로 모든 카테고리 데이터를 가져옴 (Rate Limit 방지)
export function useCategoryPreviews() {
  // 모든 탭 그룹의 카테고리를 포함
  const categories: PostCategory[] = [
    ...COMMUNITY_CATEGORIES,
    ...INFO_CATEGORIES,
    ...TEACHING_LIFE_CATEGORIES,
  ];

  return useQuery({
    queryKey: queryKeys.posts.categoryPreviews(),
    queryFn: async () => {
      // 단일 API 호출로 모든 카테고리 데이터 가져오기
      const results = await postsApi.getCategoryPreviews(categories, 3);
      return results.reduce((acc, { category, posts }) => {
        acc[category as PostCategory] = posts;
        return acc;
      }, {} as Record<PostCategory, Post[]>);
    },
    staleTime: CACHE_TIME.CATEGORY_PREVIEW,
  });
}

// 북마크 토글 훅
export function useToggleBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => postsApi.toggleBookmark(id),
    // Optimistic update: toggle bookmark state instantly
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.bookmark(id) });
      const previousBookmark = queryClient.getQueryData(queryKeys.posts.bookmark(id));
      queryClient.setQueryData(queryKeys.posts.bookmark(id), (old: { isBookmarked: boolean } | undefined) =>
        old ? { ...old, isBookmarked: !old.isBookmarked } : old,
      );
      return { previousBookmark };
    },
    onError: (_err, id, context) => {
      if (context?.previousBookmark) {
        queryClient.setQueryData(queryKeys.posts.bookmark(id), context.previousBookmark);
      }
    },
    onSettled: (_, _err, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.bookmark(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all });
    },
  });
}

// 북마크 상태 조회 훅
export function useBookmarkStatus(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.posts.bookmark(id),
    queryFn: () => postsApi.getBookmarkStatus(id),
    enabled: enabled && !!id,
    staleTime: CACHE_TIME.BOOKMARK_STATUS,
  });
}

// 좋아요 상태 조회 훅
export function useLikeStatus(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.posts.like(id),
    queryFn: () => postsApi.getLikeStatus(id),
    enabled: enabled && !!id,
    staleTime: CACHE_TIME.LIKE_STATUS,
  });
}
