import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '검색',
  description: '교사쉼터에서 게시글을 검색하세요. 특수교사, 보육교사를 위한 커뮤니티.',
  robots: {
    index: false, // 검색 결과 페이지는 검색 엔진에 노출하지 않음
    follow: true,
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
