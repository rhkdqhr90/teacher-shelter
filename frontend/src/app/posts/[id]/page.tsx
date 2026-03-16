import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import { PostDetail } from '@/features/posts/components';
import { POST_CATEGORY_LABELS } from '@/features/posts/types';
import { API_URL } from '@/lib/constants';

interface PostPageProps {
  params: Promise<{
    id: string;
  }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://teacherlounge.co.kr';

// JSON-LD dangerouslySetInnerHTML XSS 방어:
// JSON.stringify는 </script>를 이스케이프하지 않아
// post.title 등에 악의적 스크립트 삽입 시 HTML 파서가 <script> 태그를 조기 종료시킬 수 있음
// < > & 를 유니코드 이스케이프(\u003c 등)로 치환하여 HTML 파서가 태그로 해석하지 않도록 처리
// JSON 파서는 \u003c를 다시 < 로 복원하므로 데이터 무결성 유지
function serializeJsonLd(data: object): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

// 서버에서 게시글 데이터 가져오기
// Next.js 데이터 캐시로 generateMetadata↔PostPage 간 중복 네트워크 요청 자동 제거
async function getPost(id: string) {
  try {
    const res = await fetch(`${API_URL}/posts/${id}`, {
      next: { revalidate: 60 }, // 60초 캐시 (기존 유지)
    });
    // 404: 게시글 없음 / 그 외 에러: API 일시장애로 구분
    if (res.status === 404) return { notFound: true as const };
    if (!res.ok) return null; // null = API 일시장애 (404가 아님)
    return res.json();
  } catch {
    return null; // 네트워크 오류 = API 일시장애
  }
}

// 동적 메타데이터 생성
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);

  if (!post || post.notFound) {
    return {
      title: '게시글을 찾을 수 없습니다',
      robots: { index: false },
    };
  }

  // HTML 태그 제거하고 텍스트만 추출
  const plainContent = post.content.replace(/<[^>]*>/g, '').slice(0, 160);
  const categoryLabel = POST_CATEGORY_LABELS[post.category as keyof typeof POST_CATEGORY_LABELS] || '';
  const postUrl = `${SITE_URL}/posts/${id}`;

  // 익명 게시판은 noindex (개인정보·명예훼손 위험, 크롤링 예산 절약)
  const isAnonymousCategory = post.category === 'ANONYMOUS';

  return {
    title: post.title,
    description: plainContent || `${categoryLabel} 게시글`,
    // canonical: 쿼리스트링·SNS 공유 등 중복 URL 인덱싱 방지
    alternates: {
      canonical: postUrl,
    },
    robots: isAnonymousCategory
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
      authors: post.isAnonymous ? ['익명'] : [post.author?.nickname || ''],
      tags: [categoryLabel, '교사', '커뮤니티'],
    },
    twitter: {
      card: 'summary',
      title: post.title,
      description: plainContent || `${categoryLabel} 게시글`,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;

  // JSON-LD 생성을 위한 데이터 조회
  // - generateMetadata와 동일한 fetch URL·옵션이므로 Next.js 데이터 캐시가 자동으로 중복 요청 제거
  // - 실패 시 JSON-LD 없이 렌더링 (페이지 자체에는 영향 없음)
  const post = await getPost(id);

  // 404: 실제로 존재하지 않는 게시글
  if (post?.notFound) {
    notFound();
  }
  // null: API 일시장애 → PostDetail(CSR)이 자체적으로 데이터 재조회 + 에러 UI 처리
  // 기존 동작 유지: 서버 fetch 실패해도 클라이언트에서 retry 가능

  // post가 null(API 일시장애)이면 JSON-LD 없이 렌더링 (PostDetail CSR이 자체 처리)
  const categoryLabel = post
    ? POST_CATEGORY_LABELS[post.category as keyof typeof POST_CATEGORY_LABELS] || '커뮤니티'
    : '';
  const postUrl = `${SITE_URL}/posts/${id}`;
  const plainContent = post
    ? (post.content as string).replace(/<[^>]*>/g, '').slice(0, 300)
    : '';

  // JSON-LD 구조화 데이터 (DiscussionForumPosting: 포럼/커뮤니티 게시글에 적합한 타입)
  // serializeJsonLd()로 </script> XSS 방어
  const articleJsonLd = post ? {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
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
        },
    publisher: {
      '@type': 'Organization',
      name: '교사쉼터',
      url: SITE_URL,
    },
    articleSection: categoryLabel,
    inLanguage: 'ko-KR',
  } : null;

  const breadcrumbJsonLd = post ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: '게시판', item: `${SITE_URL}/posts` },
      { '@type': 'ListItem', position: 3, name: categoryLabel, item: `${SITE_URL}/posts?category=${post.category}` },
      { '@type': 'ListItem', position: 4, name: post.title, item: postUrl },
    ],
  } : null;

  return (
    <MainLayout showSidebar={true}>
      {/* JSON-LD: 구글 리치 스니펫용 구조화 데이터 (렌더링에 영향 없음) */}
      {/* serializeJsonLd()로 </script> XSS 방어 적용 */}
      {articleJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleJsonLd) }}
        />
      )}
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
        />
      )}
      <div className="max-w-4xl">
        <PostDetail postId={id} />
      </div>
    </MainLayout>
  );
}
