# 교사쉼터 SEO 최적화 가이드

> 코드베이스 직접 분석 기반 | 작성일: 2026-03-16
> 기준: Next.js 15 App Router (`app/` 디렉토리)

---

## 현재 상태 진단

| 항목 | 현재 상태 | 긴급도 |
|------|-----------|--------|
| 기본 Metadata (title/description) | ✅ 완료 | - |
| OpenGraph / Twitter Card | ✅ 완료 | - |
| robots.txt | ✅ 완료 | - |
| sitemap.xml | ⚠️ 정적 페이지만 (게시글 미포함) | 🔴 높음 |
| `metadataBase` 누락 | ❌ 없음 | 🔴 높음 |
| canonical URL | ❌ 없음 | 🔴 높음 |
| JSON-LD 구조화 데이터 | ❌ 없음 | 🟠 중간 |
| OG 이미지 자동 생성 | ❌ 없음 | 🟠 중간 |
| 카테고리 URL 구조 | ⚠️ 쿼리스트링 방식 | 🟠 중간 |
| 한국어 폰트 최적화 | ⚠️ Inter만 사용 | 🟡 낮음 |
| 네이버 서치어드바이저 | ❌ 미등록 | 🔴 높음 |

---

## 1. 기술 SEO 우선순위 작업

### ✅ Priority 1 — `metadataBase` 추가 (즉시, 난이도: 낮음)

**왜 필요한가?**
현재 `layout.tsx`에 `metadataBase`가 없습니다. 이 값이 없으면 Next.js가 OG 이미지, canonical URL 등에서 상대 경로를 절대 경로로 변환하지 못합니다. 구글/카카오 크롤러가 OG 이미지를 찾지 못하는 직접적 원인이 됩니다.

**예상 효과: 높음 | 구현 난이도: 낮음**

```typescript
// app/layout.tsx — 현재 코드에 metadataBase 추가
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://teacherlounge.co.kr'
  ),
  title: {
    default: '교사쉼터',
    template: '%s | 교사쉼터',
  },
  description: '특수교사, 보육교사를 위한 커뮤니티. 고민을 나누고 정보를 공유하세요.',
  keywords: ['교사', '특수교사', '보육교사', '교사 커뮤니티', '교육', '교사쉼터'],
  authors: [{ name: '교사쉼터' }],
  creator: '교사쉼터',
  // 네이버 사이트 소유 확인용 (아래 3번 항목 참고)
  verification: {
    other: {
      'naver-site-verification': ['YOUR_NAVER_VERIFICATION_CODE'],
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: '/',  // metadataBase 기준 상대경로로 변경
    title: '교사쉼터',
    description: '특수교사, 보육교사를 위한 커뮤니티. 고민을 나누고 정보를 공유하세요.',
    siteName: '교사쉼터',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '교사쉼터',
    description: '특수교사, 보육교사를 위한 커뮤니티. 고민을 나누고 정보를 공유하세요.',
    images: ['/og-default.png'],
  },
  alternates: {
    canonical: '/',  // 홈페이지 canonical
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};
```

---

### ✅ Priority 2 — sitemap.xml 동적 게시글 포함 (즉시, 난이도: 중간)

**왜 필요한가?**
현재 `sitemap.ts`에 TODO로만 남아 있는 게시글 페이지가 실제로는 전혀 sitemap에 포함되지 않습니다. 구글 크롤러는 링크를 따라가며 발견하기도 하지만, sitemap이 없으면 새 게시글 인덱싱이 며칠~수주 늦어집니다.
또한 현재 카테고리 페이지가 `/posts?category=free` 쿼리스트링 방식인데, 이는 구글이 중복 URL로 처리할 수 있어 `/posts/free` 경로 방식으로 교체를 권장합니다.

**예상 효과: 높음 | 구현 난이도: 중간**

```typescript
// app/sitemap.ts — 실제 API 연동 버전
import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://teacherlounge.co.kr';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.teacherlounge.co.kr';

// 카테고리 슬러그 → 경로 (쿼리스트링 대신 경로 방식 권장)
const CATEGORY_SLUGS = ['free', 'anonymous', 'humor', 'info', 'knowhow', 'legal-qna', 'job-posting'];

async function getRecentPosts(): Promise<{ id: number; updatedAt: string; category: string }[]> {
  try {
    // 최근 1000개 게시글만 sitemap에 포함 (너무 많으면 sitemap 분할 필요)
    const res = await fetch(`${API_URL}/posts?limit=1000&sort=updatedAt`, {
      next: { revalidate: 3600 }, // 1시간마다 재생성
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || data.data || [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ];

  // 카테고리 페이지 (경로 방식)
  const categoryPages: MetadataRoute.Sitemap = CATEGORY_SLUGS.map((slug) => ({
    url: `${BASE_URL}/posts/${slug}`,  // 쿼리스트링 → 경로 방식
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // 동적 게시글 페이지
  const posts = await getRecentPosts();
  const postPages: MetadataRoute.Sitemap = posts
    .filter((post) => post.category !== 'anonymous') // 익명 게시판은 noindex 처리
    .map((post) => ({
      url: `${BASE_URL}/posts/${post.id}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

  return [...staticPages, ...categoryPages, ...postPages];
}
```

> **게시글이 5만 건 이상이라면 sitemap 분할이 필요합니다.**
> `app/sitemap/[page]/route.ts` 방식으로 paginated sitemap + sitemap index를 구성하세요.

---

### ✅ Priority 3 — 게시글 canonical + JSON-LD Article 스키마 (즉시, 난이도: 중간)

**왜 필요한가?**
canonical이 없으면 같은 게시글이 `/posts/123`, `/posts/123?ref=share` 등 다양한 URL로 인덱싱되어 중복 콘텐츠 패널티 위험이 있습니다. JSON-LD Article 스키마는 구글 검색 결과에 리치 스니펫(작성일, 저자 등)을 표시해 클릭률(CTR)을 높입니다.

**예상 효과: 높음 | 구현 난이도: 중간**

```typescript
// app/posts/[id]/page.tsx — 개선된 버전

import type { Metadata } from 'next';
import Script from 'next/script';
import { MainLayout } from '@/components/layout';
import { PostDetail } from '@/features/posts/components';
import { POST_CATEGORY_LABELS } from '@/features/posts/types';
import { API_URL } from '@/lib/constants';
import { notFound } from 'next/navigation';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://teacherlounge.co.kr';

interface PostPageProps {
  params: Promise<{ id: string }>;
}

async function getPost(id: string) {
  try {
    const res = await fetch(`${API_URL}/posts/${id}`, {
      next: { revalidate: 300 }, // 5분 캐시로 상향 (60초는 너무 짧아 서버 부하)
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ── 메타데이터 ──────────────────────────────────────────────────
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    return { title: '게시글을 찾을 수 없습니다', robots: { index: false } };
  }

  const plainContent = post.content.replace(/<[^>]*>/g, '').slice(0, 160);
  const categoryLabel = POST_CATEGORY_LABELS[post.category as keyof typeof POST_CATEGORY_LABELS] || '';
  const postUrl = `${SITE_URL}/posts/${id}`;

  // 저품질/익명 게시글은 noindex 처리
  const isLowQuality =
    post.category === 'anonymous' ||
    plainContent.length < 50 ||
    (post.viewCount < 10 && post.likeCount < 1);

  return {
    title: post.title,
    description: plainContent || `${categoryLabel} 게시글 | 교사쉼터`,
    // ✅ canonical 추가
    alternates: {
      canonical: postUrl,
    },
    // ✅ 저품질 게시글 noindex
    robots: isLowQuality
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: post.title,
      description: plainContent || `${categoryLabel} 게시글`,
      type: 'article',
      url: postUrl,
      siteName: '교사쉼터',
      locale: 'ko_KR',
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      authors: post.isAnonymous ? undefined : [post.author?.nickname || '교사'],
      tags: [categoryLabel, '교사', '커뮤니티', '교사쉼터'],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: plainContent || `${categoryLabel} 게시글`,
    },
  };
}

// ── JSON-LD 생성 헬퍼 ────────────────────────────────────────────
function buildArticleJsonLd(post: any, id: string) {
  const postUrl = `${SITE_URL}/posts/${id}`;
  const categoryLabel = POST_CATEGORY_LABELS[post.category as keyof typeof POST_CATEGORY_LABELS] || '커뮤니티';
  const plainContent = post.content.replace(/<[^>]*>/g, '').slice(0, 300);

  return {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting', // Article보다 커뮤니티 포스트에 정확한 타입
    '@id': postUrl,
    url: postUrl,
    headline: post.title,
    articleBody: plainContent,
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    author: post.isAnonymous
      ? { '@type': 'Person', name: '익명' }
      : {
          '@type': 'Person',
          name: post.author?.nickname || '교사',
          url: `${SITE_URL}/profile/${post.author?.id}`,
        },
    publisher: {
      '@type': 'Organization',
      name: '교사쉼터',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    articleSection: categoryLabel,
    inLanguage: 'ko-KR',
    interactionStatistic: [
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/ViewAction',
        userInteractionCount: post.viewCount || 0,
      },
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/LikeAction',
        userInteractionCount: post.likeCount || 0,
      },
    ],
  };
}

function buildBreadcrumbJsonLd(post: any, id: string) {
  const categoryLabel = POST_CATEGORY_LABELS[post.category as keyof typeof POST_CATEGORY_LABELS] || '커뮤니티';
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: '게시판', item: `${SITE_URL}/posts` },
      { '@type': 'ListItem', position: 3, name: categoryLabel, item: `${SITE_URL}/posts/${post.category}` },
      { '@type': 'ListItem', position: 4, name: post.title, item: `${SITE_URL}/posts/${id}` },
    ],
  };
}

// ── 페이지 컴포넌트 ───────────────────────────────────────────────
export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) notFound();

  const articleJsonLd = buildArticleJsonLd(post, id);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(post, id);

  return (
    <MainLayout showSidebar={true}>
      {/* JSON-LD 구조화 데이터 */}
      <Script
        id="article-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Script
        id="breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="max-w-4xl">
        <PostDetail postId={id} />
      </div>
    </MainLayout>
  );
}
```

---

### ✅ Priority 4 — Organization JSON-LD (홈페이지, 난이도: 낮음)

**왜 필요한가?**
구글 지식 패널(Knowledge Panel)과 사이트 브랜드 검색 결과에 사이트 정보가 구조화되어 표시됩니다. 특히 "교사쉼터" 브랜드 검색 시 사이트 정보가 올바르게 표시됩니다.

**예상 효과: 중간 | 구현 난이도: 낮음**

```typescript
// app/page.tsx — 홈페이지에 Organization 스키마 추가
import Script from 'next/script';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://teacherlounge.co.kr';

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: '교사쉼터',
  alternateName: '교사 쉼터',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: '특수교사, 보육교사를 위한 커뮤니티. 고민을 나누고 정보를 공유하세요.',
  inLanguage: 'ko-KR',
  sameAs: [
    // SNS 계정이 있다면 추가
    // 'https://twitter.com/teacherlounge',
  ],
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: '교사쉼터',
  url: SITE_URL,
  // 사이트 내 검색 기능 (SearchAction) — 구글 검색 결과에 사이트 검색창 노출
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function HomePage() {
  return (
    <>
      <Script
        id="organization-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <Script
        id="website-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      {/* 기존 홈페이지 컴포넌트 */}
    </>
  );
}
```

---

### ✅ Priority 5 — OG 이미지 자동 생성 (단기, 난이도: 중간)

**왜 필요한가?**
카카오톡/네이버 블로그 공유 시 미리보기 이미지가 없으면 클릭률이 크게 낮아집니다. `next/og`의 `ImageResponse`로 게시글 제목을 넣은 OG 이미지를 자동 생성할 수 있습니다.

**예상 효과: 중간 | 구현 난이도: 중간**

```typescript
// app/og/route.tsx — OG 이미지 API 라우트
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') || '교사쉼터';
  const category = searchParams.get('category') || '';

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          padding: '60px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        {category && (
          <div style={{ fontSize: 28, opacity: 0.8, background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: 8, display: 'inline-block' }}>
            {category}
          </div>
        )}
        <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.3, maxWidth: 900 }}>
          {title.length > 50 ? title.slice(0, 50) + '...' : title}
        </div>
        <div style={{ fontSize: 32, opacity: 0.8 }}>교사쉼터 — 교사들의 커뮤니티</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

이후 `generateMetadata`에서 이 라우트를 활용:

```typescript
// app/posts/[id]/page.tsx의 generateMetadata 내부
const ogImageUrl = `/og?title=${encodeURIComponent(post.title)}&category=${encodeURIComponent(categoryLabel)}`;

openGraph: {
  images: [{ url: ogImageUrl, width: 1200, height: 630 }],
  // ...
}
```

---

### ✅ Priority 6 — 카테고리 URL 경로 방식으로 변경 (중기, 난이도: 높음)

**왜 필요한가?**
현재 `/posts?category=free` 방식은 구글이 동일한 콘텐츠를 다른 URL로 인식하거나, 카테고리 페이지 자체의 인덱싱 순위가 낮아지는 문제가 있습니다. 경로 기반 URL은 크롤링 우선순위도 높고 공유/링크 빌딩에도 유리합니다.

**예상 효과: 중간 | 구현 난이도: 높음 (라우팅 구조 변경 필요)**

```
변경 전: /posts?category=free
변경 후: /posts/free
```

```
app/
  posts/
    page.tsx          → 전체 게시글 목록
    [category]/
      page.tsx        → 카테고리별 게시글 목록
    [id]/             ← 이 부분이 충돌하므로...
      page.tsx
```

> ⚠️ **충돌 주의**: `[category]`와 `[id]`가 같은 depth에 있으면 충돌합니다.
> 두 가지 해결책:
> 1. **숫자 id 감지**: middleware나 page에서 id가 숫자이면 게시글, 아니면 카테고리
> 2. **경로 분리 (권장)**: `/posts/c/[category]`와 `/posts/[id]`로 분리

```
app/
  posts/
    page.tsx           → 전체 목록
    c/[category]/      → 카테고리 (예: /posts/c/free)
      page.tsx
    [id]/              → 게시글 상세
      page.tsx
```

---

## 2. UGC 동적 게시글 SEO 처리 전략

### 핵심 원칙: 크롤링 예산(Crawl Budget) 관리

커뮤니티 사이트에서 SEO가 어려운 가장 큰 이유는 **저품질 UGC가 크롤링 예산을 낭비**하기 때문입니다. 구글은 사이트당 하루에 크롤링하는 페이지 수가 한정되어 있어, 중요한 게시글이 제때 인덱싱되지 않는 문제가 생깁니다.

### 게시글 품질 등급별 SEO 처리

```typescript
// lib/seo-utils.ts
interface Post {
  category: string;
  content: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

export function getPostSeoPolicy(post: Post): {
  shouldIndex: boolean;
  priority: 'high' | 'medium' | 'low';
  reason: string;
} {
  const contentLength = post.content.replace(/<[^>]*>/g, '').length;

  // 1. 익명 게시판 — 항상 noindex (개인정보/명예훼손 위험)
  if (post.category === 'anonymous') {
    return { shouldIndex: false, priority: 'low', reason: '익명 게시판' };
  }

  // 2. 내용 너무 짧음 — noindex
  if (contentLength < 100) {
    return { shouldIndex: false, priority: 'low', reason: '내용 부족 (100자 미만)' };
  }

  // 3. 고품질 콘텐츠 — 적극 인덱싱
  if (
    contentLength > 500 &&
    (post.viewCount > 100 || post.likeCount > 5 || post.commentCount > 3)
  ) {
    return { shouldIndex: true, priority: 'high', reason: '고품질 콘텐츠' };
  }

  // 4. 일반 게시글 — 기본 인덱싱
  if (contentLength >= 100) {
    return { shouldIndex: true, priority: 'medium', reason: '일반 게시글' };
  }

  return { shouldIndex: false, priority: 'low', reason: '기준 미달' };
}
```

### ISR(Incremental Static Regeneration) 전략

```typescript
// app/posts/[id]/page.tsx
export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) notFound();

  return (...);
}

// fetch 캐시 전략 (getPost 함수 내부)
// 조회수 많은 게시글 → 길게 캐시 (5분)
// 새 게시글 → 짧게 캐시 (1분)
async function getPost(id: string) {
  const res = await fetch(`${API_URL}/posts/${id}`, {
    next: {
      revalidate: 300, // 5분 기본값
      tags: [`post-${id}`], // on-demand revalidation용 태그
    },
  });
  ...
}
```

NestJS 백엔드에서 게시글 수정 시 on-demand revalidation 호출:

```typescript
// NestJS — posts.service.ts (게시글 수정 후 캐시 무효화)
import axios from 'axios';

async updatePost(id: number, dto: UpdatePostDto) {
  const post = await this.postsRepository.save({ id, ...dto });

  // Next.js ISR 캐시 무효화 (게시글 수정 시 즉시 반영)
  await axios.post(
    `${process.env.FRONTEND_URL}/api/revalidate`,
    { tag: `post-${id}` },
    { headers: { 'x-revalidate-token': process.env.REVALIDATE_SECRET } }
  ).catch(console.error);

  return post;
}
```

```typescript
// app/api/revalidate/route.ts — Next.js 재검증 API
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-revalidate-token');
  if (token !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { tag } = await req.json();
  revalidateTag(tag);
  return NextResponse.json({ revalidated: true, tag });
}
```

### generateStaticParams — 인기 게시글 사전 빌드

```typescript
// app/posts/[id]/page.tsx 에 추가
export async function generateStaticParams() {
  try {
    // 조회수 상위 100개 게시글만 빌드 타임에 생성
    const res = await fetch(
      `${API_URL}/posts?limit=100&sort=viewCount&order=DESC`,
      { cache: 'no-store' }
    );
    const data = await res.json();
    const posts = data.items || data.data || [];

    return posts.map((post: { id: number }) => ({
      id: String(post.id),
    }));
  } catch {
    return [];
  }
}

// 빌드에 없는 페이지는 요청 시 동적 생성 (SSR처럼 동작 후 캐시)
export const dynamicParams = true;
```

---

## 3. 네이버 서치어드바이저 등록 및 구글과의 차이점

### 3-1. 네이버 서치어드바이저 등록 절차

1. [searchadvisor.naver.com](https://searchadvisor.naver.com) 접속 → 웹마스터 도구
2. 사이트 추가: `https://teacherlounge.co.kr`
3. 소유 확인 방법 2가지 중 선택:

**방법 A — HTML 메타태그 (권장, App Router에서 간단)**

```typescript
// app/layout.tsx의 metadata에 추가
verification: {
  other: {
    'naver-site-verification': ['실제_발급받은_코드_여기에'],
  },
},
```

생성 HTML: `<meta name="naver-site-verification" content="코드" />`

**방법 B — HTML 파일 업로드**

```
public/
  naverXXXXXXXXXXXXXXXX.html  ← 네이버에서 제공하는 파일명 그대로 저장
```

4. 등록 후 필수 설정:
   - **RSS 피드 제출**: 네이버는 sitemap.xml보다 RSS를 더 적극 활용
   - **sitemap.xml 제출**: 서치어드바이저 > 요청 > 사이트맵 제출
   - **수집 요청**: 새 콘텐츠 게시 후 URL 직접 제출 가능

### 3-2. RSS 피드 생성 (네이버 전용 필수)

**네이버 구글 차이**: 구글은 sitemap.xml만으로도 잘 크롤링하지만, **네이버는 RSS를 통한 콘텐츠 수집을 훨씬 선호**합니다. RSS가 없으면 네이버 인덱싱이 현저히 느립니다.

**예상 효과: 높음 (네이버 한정) | 구현 난이도: 낮음**

```typescript
// app/feed.xml/route.ts — RSS 2.0 피드
import { NextResponse } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://teacherlounge.co.kr';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.teacherlounge.co.kr';

export async function GET() {
  const res = await fetch(`${API_URL}/posts?limit=50&sort=createdAt&order=DESC`, {
    next: { revalidate: 3600 },
  });
  const data = await res.json();
  const posts = data.items || data.data || [];

  const rssItems = posts
    .filter((post: any) => post.category !== 'anonymous')
    .map(
      (post: any) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${SITE_URL}/posts/${post.id}</link>
      <guid isPermaLink="true">${SITE_URL}/posts/${post.id}</guid>
      <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
      <description><![CDATA[${post.content.replace(/<[^>]*>/g, '').slice(0, 300)}]]></description>
      <author><![CDATA[${post.isAnonymous ? '익명' : post.author?.nickname || '교사'}]]></author>
      <category><![CDATA[${post.category}]]></category>
    </item>`
    )
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>교사쉼터</title>
    <link>${SITE_URL}</link>
    <description>특수교사, 보육교사를 위한 커뮤니티</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
```

`robots.ts`에 RSS 피드 경로 추가:

```typescript
// app/robots.ts 수정
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [ ... ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    // 네이버 서치어드바이저에서 RSS URL 직접 입력: https://teacherlounge.co.kr/feed.xml
  };
}
```

### 3-3. 구글 vs 네이버 SEO 주요 차이점

| 항목 | 구글 | 네이버 |
|------|------|--------|
| **콘텐츠 수집** | sitemap.xml 기반 | RSS 피드 강하게 선호 |
| **JavaScript 렌더링** | Googlebot이 JS 실행 가능 | 네이버봇은 JS 렌더링 불안정. **SSR/SSG 필수** |
| **키워드 밀도** | 자연스러운 키워드, E-E-A-T 중시 | 제목에 핵심 키워드 포함이 더 중요 |
| **링크 빌딩** | 외부 링크(백링크) 매우 중요 | 상대적으로 덜 중요. 콘텐츠 품질/최신성 더 중요 |
| **구조화 데이터** | JSON-LD 완전 지원, 리치 스니펫 노출 | 제한적 지원. Knowledge Graph 미지원 |
| **페이지 속도** | Core Web Vitals 랭킹 신호 | 공식적으로 랭킹 신호 아님 (UX 측면은 영향 있음) |
| **모바일 퍼스트** | 모바일 인덱싱 기본 | 모바일웹과 PC웹 별도 크롤링 |
| **중복 콘텐츠** | canonical 처리 필요 | canonical 지원하지만 처리 불안정. URL 정규화 선제 대응 필요 |

### 3-4. 네이버 인덱싱 확인 방법

```
# 네이버에서 인덱싱된 페이지 확인
site:teacherlounge.co.kr

# 특정 페이지 확인
site:teacherlounge.co.kr/posts/123
```

네이버 인덱싱은 구글보다 **2~4주 더 소요**될 수 있으며, 서치어드바이저의 "수집 요청" 기능을 적극 활용하면 단축됩니다.

---

## 빠른 실행 체크리스트

- [ ] `metadataBase` 추가 (1시간)
- [ ] `sitemap.ts` 동적 게시글 포함 (2~3시간)
- [ ] `posts/[id]/page.tsx`에 canonical + JSON-LD 추가 (2~3시간)
- [ ] 홈페이지에 Organization + WebSite JSON-LD 추가 (1시간)
- [ ] 네이버 서치어드바이저 등록 + 사이트 소유 확인 (30분)
- [ ] RSS 피드 `/feed.xml` 생성 후 네이버 서치어드바이저 제출 (2시간)
- [ ] `/og` 라우트로 동적 OG 이미지 생성 (3~4시간)
- [ ] 카테고리 URL 구조 경로 방식으로 변경 (1~2일, 별도 계획 필요)

> SEO는 작업 후 구글 기준 **3~6개월**, 네이버 기준 **1~3개월** 후 효과를 확인할 수 있습니다.
> 검색 경쟁 강도와 사이트 도메인 나이에 따라 결과는 달라집니다.
