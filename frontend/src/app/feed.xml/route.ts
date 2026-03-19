// RSS 2.0 피드 - 네이버 서치어드바이저 콘텐츠 수집용
// 네이버는 sitemap.xml보다 RSS를 통한 콘텐츠 인덱싱을 선호
// 등록 경로: 네이버 서치어드바이저 > 요청 > RSS 제출 > https://www.teacherlounge.co.kr/feed.xml
import { NextResponse } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.teacherlounge.co.kr';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// XML 특수문자 이스케이프 (일반 텍스트 노드용)
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// CDATA 섹션 내부에서 ]]> 가 있으면 CDATA가 조기 종료되어 XML 구조가 파괴됨
// ]]> → ]]]]><![CDATA[> 로 분리하여 안전하게 처리
function safeCdata(str: string): string {
  return str.replace(/\]\]>/g, ']]]]><![CDATA[>');
}

export async function GET() {
  let posts: Array<{
    id: string;
    title: string;
    content: string;
    category: string;
    isAnonymous: boolean;
    createdAt: string;
    author: { nickname: string } | null;
  }> = [];

  try {
    // 파라미터명: sort (not sortBy), order (not sortOrder) — NestJS PaginationDto 기준
    // forbidNonWhitelisted: true 설정으로 잘못된 파라미터명은 400 반환됨
    const res = await fetch(
      `${API_URL}/posts?limit=50&page=1&sort=createdAt&order=desc`,
      {
        next: { revalidate: 3600 }, // 1시간 캐시
        signal: AbortSignal.timeout(5000),
      },
    );
    if (res.ok) {
      const data = await res.json();
      // 응답 구조: { data: PostResponseDto[], meta: { ... } }
      posts = Array.isArray(data?.data) ? data.data : [];
    }
  } catch {
    // API 장애 시 빈 피드 반환 (500 에러 방지)
  }

  const rssItems = posts
    .filter(
      (post) =>
        // 익명 게시판 제외 (개인정보 보호)
        post.category !== 'ANONYMOUS' && post.id && post.title,
    )
    .map((post) => {
      const plainContent = post.content.replace(/<[^>]*>/g, '').slice(0, 300);
      const authorName = post.isAnonymous
        ? '익명'
        : post.author?.nickname || '교사';

      // CDATA 내부의 ]]> 는 XML 파서가 CDATA 종료로 인식 → safeCdata로 분리 처리
      return `
    <item>
      <title><![CDATA[${safeCdata(post.title)}]]></title>
      <link>${SITE_URL}/posts/${post.id}</link>
      <guid isPermaLink="true">${SITE_URL}/posts/${post.id}</guid>
      <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
      <description><![CDATA[${safeCdata(plainContent)}]]></description>
      <author>${escapeXml(authorName)}</author>
      <category>${escapeXml(post.category)}</category>
    </item>`;
    })
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>교사쉼터</title>
    <link>${SITE_URL}</link>
    <description>특수교사, 보육교사를 위한 커뮤니티. 교사쉼터의 최신 게시글</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/og-default.png</url>
      <title>교사쉼터</title>
      <link>${SITE_URL}</link>
    </image>
    ${rssItems}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
