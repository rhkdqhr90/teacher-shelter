// posts/page.tsx가 'use client'이므로 metadata는 이 layout에서 선언
// 참고: faq/layout.tsx 동일한 패턴 사용 중
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '게시판',
  description:
    '특수교사, 보육교사들의 자유게시판, 노하우 공유, 정보 게시판. 교사쉼터 커뮤니티에서 동료 교사들과 소통하세요.',
  openGraph: {
    title: '게시판 | 교사쉼터',
    description:
      '특수교사, 보육교사들의 자유게시판, 노하우 공유, 정보 게시판. 교사쉼터 커뮤니티에서 동료 교사들과 소통하세요.',
    type: 'website',
  },
};

export default function PostsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
