import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '문의하기',
  description: '교사쉼터 고객센터 문의하기',
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
