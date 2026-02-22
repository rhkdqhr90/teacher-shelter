import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/config/i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      // 로컬 개발 환경
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      // 프로덕션 API 서버 (환경에 맞게 수정 필요)
      {
        protocol: 'https',
        hostname: '*.teacher-shelter.com',
      },
    ],
  },
  // 보안 헤더는 middleware.ts에서 일원화 관리 (중복 방지)
};

export default withNextIntl(nextConfig);
