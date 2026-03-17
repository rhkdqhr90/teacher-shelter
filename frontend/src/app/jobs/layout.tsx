import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '구인구직',
  description:
    '특수교사, 보육교사, 치료사 채용 정보. 언어치료, 행동치료, 미술치료 등 구인공고를 확인하세요.',
  openGraph: {
    title: '구인구직 | 교사쉼터',
    description:
      '특수교사, 보육교사, 치료사 채용 정보. 언어치료, 행동치료, 미술치료 등 구인공고를 확인하세요.',
    type: 'website',
  },
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
