import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://teacherlounge.co.kr';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// PostCategory enum 중 sitemap에 포함할 카테고리 (ANONYMOUS 제외)
// 실제 enum 값은 대문자 (FREE, HUMOR, ...) 사용
const INDEXABLE_CATEGORIES = [
  'FREE',
  'HUMOR',
  'INFO',
  'KNOWHOW',
  'CLASS_MATERIAL',
  'CERTIFICATION',
  'SCHOOL_EVENT',
  'PARENT_COUNSEL',
  'TEACHER_DAYCARE',
  'TEACHER_SPECIAL',
  'TEACHER_KINDERGARTEN',
  'LEGAL_QNA',
  'JOB_POSTING',
] as const;

interface SitemapPost {
  id: string;
  createdAt: string; // 백엔드 sort 옵션: createdAt | viewCount | likeCount (updatedAt 미지원)
  category: string;
}

// 게시글 목록 API 호출 - 실패 시 빈 배열 반환 (sitemap 자체가 깨지면 안 됨)
async function getPostsForSitemap(): Promise<SitemapPost[]> {
  try {
    // 파라미터명: sort (not sortBy), order (not sortOrder) — NestJS PaginationDto 기준
    // forbidNonWhitelisted: true 설정으로 잘못된 파라미터명은 400 반환됨
    const res = await fetch(
      `${API_URL}/posts?limit=500&page=1&sort=createdAt&order=desc`,
      {
        next: { revalidate: 3600 }, // 1시간마다 재생성
        signal: AbortSignal.timeout(5000), // 5초 타임아웃 (빌드/크롤링 지연 방지)
      },
    );
    if (!res.ok) return [];
    const data = await res.json();
    // 응답 구조: { data: PostResponseDto[], meta: { ... } }
    return Array.isArray(data?.data) ? data.data : [];
  } catch {
    // API 장애 시 sitemap 빌드 실패 방지 - 정적 페이지만 반환
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── 정적 페이지 ─────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/announcements`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // ── 카테고리 페이지 (대문자 enum 값, ANONYMOUS 제외) ────────
  const categoryPages: MetadataRoute.Sitemap = INDEXABLE_CATEGORIES.map((category) => ({
    url: `${BASE_URL}/posts?category=${category}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // ── 동적 게시글 페이지 ────────────────────────────────────
  const posts = await getPostsForSitemap();
  const postPages: MetadataRoute.Sitemap = posts
    .filter((post) => {
      // ANONYMOUS 카테고리 제외 (익명 게시글 noindex 처리와 일관성 유지)
      if (post.category === 'ANONYMOUS') return false;
      // id 필수
      if (!post.id) return false;
      // createdAt 유효성: 잘못된 날짜 문자열이면 Invalid Date → toISOString() throw → sitemap 빌드 크래시
      if (!post.createdAt || isNaN(new Date(post.createdAt).getTime())) return false;
      return true;
    })
    .map((post) => ({
      url: `${BASE_URL}/posts/${post.id}`,
      lastModified: new Date(post.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

  return [...staticPages, ...categoryPages, ...postPages];
}
