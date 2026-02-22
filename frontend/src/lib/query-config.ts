/**
 * React Query 캐싱 전략 설정
 * 엔드포인트별로 적절한 캐시 시간을 정의합니다.
 */

// 밀리초 단위 시간 헬퍼
const SECONDS = 1000;
const MINUTES = 60 * SECONDS;

/**
 * 데이터 유형별 캐시 설정
 */
export const CACHE_TIME = {
  // 자주 변경되는 데이터 (짧은 캐시)
  POSTS_LIST: 3 * MINUTES,        // 게시글 목록: 3분
  COMMENTS: 2 * MINUTES,          // 댓글: 2분
  NOTIFICATIONS: 1 * MINUTES,     // 알림: 1분

  // 중간 빈도 변경 데이터
  HOT_POSTS: 5 * MINUTES,         // 인기글: 5분
  CATEGORY_PREVIEW: 2 * MINUTES,  // 카테고리 미리보기: 2분
  SEARCH_RESULTS: 3 * MINUTES,    // 검색 결과: 3분

  // 거의 변경되지 않는 데이터 (긴 캐시)
  POST_DETAIL: 10 * MINUTES,      // 게시글 상세: 10분
  USER_PROFILE: 15 * MINUTES,     // 사용자 프로필: 15분
  MY_PROFILE: 10 * MINUTES,       // 내 프로필: 10분

  // 상태 체크 (짧은 캐시)
  BOOKMARK_STATUS: 5 * MINUTES,   // 북마크 상태: 5분
  LIKE_STATUS: 5 * MINUTES,       // 좋아요 상태: 5분
  UNREAD_COUNT: 30 * SECONDS,     // 읽지 않은 알림 수: 30초

  // 공지사항 및 배너
  ANNOUNCEMENTS: 5 * MINUTES,     // 공지사항: 5분
  BANNERS: 10 * MINUTES,          // 배너: 10분
} as const;

/**
 * GC(가비지 컬렉션) 시간 - staleTime보다 길어야 함
 */
export const GC_TIME = {
  DEFAULT: 10 * MINUTES,
  LONG: 30 * MINUTES,
} as const;

/**
 * 쿼리 키 팩토리
 * 일관된 쿼리 키 생성을 위한 헬퍼
 */
export const queryKeys = {
  posts: {
    all: ['posts'] as const,
    lists: () => [...queryKeys.posts.all, 'list'] as const,
    list: (filters: object) => [...queryKeys.posts.lists(), filters] as const,
    infinite: (filters: object) => [...queryKeys.posts.all, 'infinite', filters] as const,
    details: () => [...queryKeys.posts.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.posts.details(), id] as const,
    hot: () => [...queryKeys.posts.all, 'hot'] as const,
    categoryPreviews: () => [...queryKeys.posts.all, 'categoryPreviews'] as const,
    bookmark: (id: string) => [...queryKeys.posts.all, id, 'bookmark'] as const,
    like: (id: string) => [...queryKeys.posts.all, id, 'like'] as const,
  },
  comments: {
    all: ['comments'] as const,
    list: (postId: string) => [...queryKeys.comments.all, postId] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: () => [...queryKeys.notifications.all, 'list'] as const,
    unreadCount: () => [...queryKeys.notifications.all, 'unreadCount'] as const,
  },
  profile: {
    all: ['profile'] as const,
    me: () => [...queryKeys.profile.all, 'me'] as const,
    user: (id: string) => [...queryKeys.profile.all, id] as const,
    myPosts: () => [...queryKeys.profile.all, 'myPosts'] as const,
    myComments: () => [...queryKeys.profile.all, 'myComments'] as const,
    myBookmarks: () => [...queryKeys.profile.all, 'myBookmarks'] as const,
  },
  bookmarks: {
    all: ['bookmarks'] as const,
  },
  announcements: {
    all: ['announcements'] as const,
    list: () => [...queryKeys.announcements.all, 'list'] as const,
    latest: (limit: number) => [...queryKeys.announcements.all, 'latest', limit] as const,
    pinned: () => [...queryKeys.announcements.all, 'pinned'] as const,
    detail: (id: string) => [...queryKeys.announcements.all, id] as const,
  },
  banners: {
    all: ['banners'] as const,
    active: () => [...queryKeys.banners.all, 'active'] as const,
  },
} as const;
