import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Providers } from '@/providers';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

// metadataBase: OG 이미지·canonical 등 상대경로를 절대 URL로 변환하는 기준점
// 없으면 카카오/네이버 공유 미리보기 이미지가 깨짐
// NEXT_PUBLIC_SITE_URL이 빈 문자열("")로 설정된 경우 new URL("")이 throw하므로
// || 연산자로 빈 문자열도 fallback 처리 (빈 문자열은 falsy)
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.teacherlounge.co.kr').trim();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: '교사쉼터',
    template: '%s | 교사쉼터',
  },
  description: '특수교사, 보육교사를 위한 커뮤니티. 고민을 나누고 정보를 공유하세요.',
  keywords: ['교사', '특수교사', '보육교사', '교사 커뮤니티', '교육', '교사쉼터'],
  authors: [{ name: '교사쉼터' }],
  creator: '교사쉼터',
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
    other: { 'naver-site-verification': ['a4be6b7d0289d9058229b6367486ca8a6873dcbf'] },
  },
  alternates: {
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: '/', // metadataBase 기준 상대경로
    title: '교사쉼터',
    description: '특수교사, 보육교사를 위한 커뮤니티. 고민을 나누고 정보를 공유하세요.',
    siteName: '교사쉼터',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: '교사쉼터' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '교사쉼터',
    description: '특수교사, 보육교사를 위한 커뮤니티. 고민을 나누고 정보를 공유하세요.',
    images: ['/og-default.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // CSP nonce: middleware에서 x-nonce 헤더를 설정하고, headers()를 호출하여 동적 렌더링 강제
  // Next.js는 응답의 CSP 헤더에서 nonce를 자동 추출하여 내부 인라인 스크립트(<script>)에 적용
  // 향후 외부 스크립트 추가 시: <Script nonce={nonce} src="..." />
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const nonce = (await headers()).get('x-nonce') || '';

  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      {/* 향후 외부 스크립트 추가 시 nonce prop을 전달: <Script nonce={nonce} ... /> */}
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
