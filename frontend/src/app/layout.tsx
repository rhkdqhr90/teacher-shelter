import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Providers } from '@/providers';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: {
    default: '교사쉼터',
    template: '%s | 교사쉼터',
  },
  description: '특수교사, 보육교사를 위한 커뮤니티. 고민을 나누고 정보를 공유하세요.',
  keywords: ['교사', '특수교사', '보육교사', '교사 커뮤니티', '교육', '교사쉼터'],
  authors: [{ name: '교사쉼터' }],
  creator: '교사쉼터',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://teacher-shelter.com',
    title: '교사쉼터',
    description: '특수교사, 보육교사를 위한 커뮤니티. 고민을 나누고 정보를 공유하세요.',
    siteName: '교사쉼터',
  },
  twitter: {
    card: 'summary_large_image',
    title: '교사쉼터',
    description: '특수교사, 보육교사를 위한 커뮤니티. 고민을 나누고 정보를 공유하세요.',
  },
  robots: {
    index: true,
    follow: true,
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
