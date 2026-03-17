import { Metadata } from 'next';
import { HomeContent } from './home-content';
import { API_URL } from '@/lib/constants';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://teacherlounge.co.kr';

export const metadata: Metadata = {
  title: { absolute: '교사쉼터 - 특수교사·보육교사 커뮤니티' },
  description:
    '특수교사, 보육교사를 위한 커뮤니티. 자유게시판, 구인구직, 수업자료, 노하우 공유. 동료 교사들과 고민을 나누고 정보를 공유하세요.',
  keywords: [
    '교사쉼터',
    '특수교사',
    '보육교사',
    '교사 커뮤니티',
    '특수교사 커뮤니티',
    '보육교사 커뮤니티',
    '교사 구인구직',
    '수업자료',
    '교사 고민',
  ],
  alternates: {
    canonical: SITE_URL,
  },
};

// JSON-LD XSS 방어
function serializeJsonLd(data: object): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

// 서버에서 인기글 가져오기 (SEO용 HTML 콘텐츠)
async function getHotPosts() {
  try {
    const res = await fetch(`${API_URL}/posts/hot?limit=5`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const hotPosts = await getHotPosts();

  // 구조화 데이터: WebSite + SearchAction (사이트 내 검색)
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '교사쉼터',
    url: SITE_URL,
    description:
      '특수교사, 보육교사를 위한 커뮤니티. 고민을 나누고 정보를 공유하세요.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '교사쉼터',
    url: SITE_URL,
    logo: `${SITE_URL}/og-default.png`,
    description:
      '특수교사, 보육교사를 위한 커뮤니티',
  };

  return (
    <>
      {/* JSON-LD 구조화 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationJsonLd) }}
      />

      {/* SEO용 서버 렌더링 콘텐츠 (크롤러가 읽을 수 있는 텍스트) */}
      {hotPosts.length > 0 && (
        <section className="sr-only" aria-label="인기 게시글">
          <h1>교사쉼터 - 특수교사·보육교사 커뮤니티</h1>
          <p>
            특수교사, 보육교사를 위한 커뮤니티입니다. 자유게시판, 구인구직,
            수업자료, 노하우를 공유하세요.
          </p>
          <h2>인기 게시글</h2>
          <ul>
            {hotPosts.map((post: { id: string; title: string; category: string }) => (
              <li key={post.id}>
                <a href={`/posts/${post.id}`}>{post.title}</a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 실제 CSR 화면 */}
      <HomeContent />
    </>
  );
}
