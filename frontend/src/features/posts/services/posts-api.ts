import { api } from '@/lib/api-client';
import type { Post, PostsResponse, CreatePostInput, UpdatePostInput, PostCategory, JobSubCategory, Region, TherapyTag } from '../types';

interface GetPostsParams {
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

export const postsApi = {
  // 게시글 목록 조회
  async getPosts(params: GetPostsParams = {}): Promise<PostsResponse> {
    const {
      page = 1,
      limit = 20,
      category,
      sort = 'createdAt',
      order = 'desc',
      search,
      jobSubCategory,
      region,
      isRecruiting,
      therapyTags,
    } = params;

    const queryParams = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sort,
      order,
    });

    if (category) queryParams.append('category', category);
    if (search) queryParams.append('search', search);
    // 구인공고 필터 추가
    if (jobSubCategory) queryParams.append('jobSubCategory', jobSubCategory);
    if (region) queryParams.append('region', region);
    if (isRecruiting !== undefined) queryParams.append('isRecruiting', String(isRecruiting));
    if (therapyTags && therapyTags.length > 0) queryParams.append('therapyTags', therapyTags.join(','));

    const response = await api.get<PostsResponse>(`/posts?${queryParams}`);
    return response.data;
  },

  // 게시글 상세 조회
  async getPost(id: string): Promise<Post> {
    const response = await api.get<Post>(`/posts/${id}`);
    return response.data;
  },

  // 게시글 작성
  async createPost(data: CreatePostInput): Promise<Post> {
    const response = await api.post<Post>('/posts', data);
    return response.data;
  },

  // 게시글 수정
  async updatePost(id: string, data: UpdatePostInput): Promise<Post> {
    const response = await api.patch<Post>(`/posts/${id}`, data);
    return response.data;
  },

  // 게시글 삭제
  async deletePost(id: string): Promise<void> {
    await api.delete(`/posts/${id}`);
  },

  // 좋아요 토글
  async toggleLike(id: string): Promise<{ liked: boolean; likeCount: number }> {
    const response = await api.post<{ liked: boolean; likeCount: number }>(`/posts/${id}/like`);
    return response.data;
  },

  // 인기글 조회
  async getHotPosts(): Promise<Post[]> {
    const response = await api.get<Post[]>('/posts/hot');
    return response.data;
  },

  // 북마크 토글
  async toggleBookmark(id: string): Promise<{ bookmarked: boolean }> {
    const response = await api.post<{ bookmarked: boolean }>(`/posts/${id}/bookmark`);
    return response.data;
  },

  // 북마크 상태 확인
  async getBookmarkStatus(id: string): Promise<{ bookmarked: boolean }> {
    const response = await api.get<{ bookmarked: boolean }>(`/posts/${id}/bookmark`);
    return response.data;
  },

  // 좋아요 상태 확인
  async getLikeStatus(id: string): Promise<{ liked: boolean }> {
    const response = await api.get<{ liked: boolean }>(`/posts/${id}/like`);
    return response.data;
  },

  // 카테고리별 프리뷰 조회 (홈 화면용 - 단일 API)
  async getCategoryPreviews(categories: string[], limit = 3): Promise<{ category: string; posts: Post[] }[]> {
    const response = await api.get<{ category: string; posts: Post[] }[]>(
      `/posts/category-previews?categories=${categories.join(',')}&limit=${limit}`
    );
    return response.data;
  },
};
