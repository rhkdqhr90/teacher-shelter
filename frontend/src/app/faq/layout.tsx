import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '자주 묻는 질문',
  description: '교사쉼터 서비스 이용에 관한 자주 묻는 질문과 답변',
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
