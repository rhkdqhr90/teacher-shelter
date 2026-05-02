import { Metadata } from 'next';
import { HomeContent } from './home-content';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.teacherlounge.co.kr').trim();

export const metadata: Metadata = {
  title: { absolute: '교사쉼터 - 특수교사·보육교사·어린이집교사 커뮤니티' },
  description:
    '특수교사, 보육교사, 어린이집 교사, 유치원교사를 위한 커뮤니티. 자유게시판, 구인구직, 수업자료, 노하우 공유. 교사들의 고민과 정보를 나누는 교사쉼터.',
  keywords: [
    '교사',
    '교사쉼터',
    '특수교사',
    '보육교사',
    '어린이집 교사',
    '유치원교사',
    '어린이집',
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
  return JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

export default async function HomePage() {
  // 구조화 데이터: WebSite + SearchAction (사이트 내 검색)
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '교사쉼터',
    url: SITE_URL,
    description: '특수교사, 보육교사, 어린이집 교사, 유치원교사를 위한 커뮤니티. 고민을 나누고 정보를 공유하세요.',
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
    description: '특수교사, 보육교사, 어린이집 교사, 유치원교사를 위한 커뮤니티',
  };

  return (
    <>
      {/* JSON-LD 구조화 데이터 */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationJsonLd) }} />

      {/* SSR 브랜드 섹션을 MainLayout 안 children으로 전달 — 서버에서 렌더링되어 크롤러가 읽고 사용자에게도 보임 */}
      <HomeContent>
        <section className="mb-4 pb-3 border-b border-border" aria-label="사이트 소개">
          <h1 className="text-lg font-semibold text-foreground">교사쉼터 - 특수교사·보육교사·어린이집교사 커뮤니티</h1>
          <p className="text-sm text-muted-foreground mt-1">
            특수교사, 보육교사, 어린이집 교사, 유치원교사를 위한 커뮤니티. 자유게시판, 구인구직, 수업자료, 노하우를 공유하세요.
          </p>
        </section>
      </HomeContent>
    </>
  );
}
