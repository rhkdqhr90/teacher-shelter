import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, Users, MessageSquare, Briefcase, Shield, Heart, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: '서비스 소개',
  description: '교사쉼터 - 특수교사, 보육교사를 위한 커뮤니티 서비스를 소개합니다.',
};

const features = [
  {
    icon: MessageSquare,
    title: '자유로운 소통',
    description: '자유게시판, 익명게시판에서 동료 교사들과 고민을 나누고 정보를 공유하세요.',
  },
  {
    icon: BookOpen,
    title: '전문 노하우 공유',
    description: '현장에서 쌓은 경험과 노하우를 공유하고, 다른 선생님들의 지혜를 배워보세요.',
  },
  {
    icon: Shield,
    title: '법률 Q&A',
    description: '교육 현장에서 겪는 법률 문제에 대해 전문가의 조언을 받아보세요.',
  },
  {
    icon: Briefcase,
    title: '구인공고',
    description: '특수교육, 보육 분야의 채용 정보를 확인하고 지원하세요.',
  },
  {
    icon: Users,
    title: '교사 인증 시스템',
    description: '재직증명서를 통한 인증으로 신뢰할 수 있는 커뮤니티를 만들어갑니다.',
  },
  {
    icon: Heart,
    title: '서로를 응원하는 공간',
    description: '힘든 하루를 보낸 선생님들이 위로받고 응원받을 수 있는 따뜻한 공간입니다.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Link
            href="/"
            className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            홈으로 돌아가기
          </Link>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            교사쉼터에 오신 것을
            <br />
            <span className="text-primary">환영합니다</span>
          </h1>

          <p className="mt-6 text-lg text-muted-foreground">
            특수교사, 보육교사, 유치원교사, 돌봄교사 여러분을 위한
            <br className="hidden sm:block" />
            전문 커뮤니티입니다.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">무료로 시작하기</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/posts">게시글 둘러보기</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 소개 섹션 */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <h2 className="text-center">교사쉼터는</h2>
            <p className="text-center text-lg text-muted-foreground">
              아이들을 위해 헌신하는 선생님들이 잠시 쉬어갈 수 있는 공간입니다.
              <br />
              서로의 경험을 나누고, 고민을 털어놓고, 함께 성장할 수 있는 커뮤니티를 만들어가고 있습니다.
            </p>
          </div>
        </div>
      </section>

      {/* 기능 소개 */}
      <section className="bg-muted/50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold">주요 기능</h2>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 대상 사용자 */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-3xl font-bold">이런 분들을 위해 만들었어요</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <h3 className="mb-2 font-semibold">특수교사</h3>
              <p className="text-sm text-muted-foreground">
                특수학교, 특수학급에서 아이들과 함께하는 선생님
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="mb-2 font-semibold">보육교사</h3>
              <p className="text-sm text-muted-foreground">
                어린이집에서 영유아를 돌보는 선생님
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="mb-2 font-semibold">유치원교사</h3>
              <p className="text-sm text-muted-foreground">
                유치원에서 아이들의 첫 배움을 이끄는 선생님
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="mb-2 font-semibold">돌봄교사</h3>
              <p className="text-sm text-muted-foreground">
                방과후 돌봄교실에서 아이들과 함께하는 선생님
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold">지금 바로 시작하세요</h2>
          <p className="mt-4 text-lg opacity-90">
            무료로 가입하고 동료 선생님들과 소통해보세요.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" variant="secondary">
              <Link href="/register">회원가입</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 푸터 링크 */}
      <section className="py-8">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground hover:underline">
              이용약관
            </Link>
            <span>|</span>
            <Link href="/privacy" className="hover:text-foreground hover:underline">
              개인정보처리방침
            </Link>
            <span>|</span>
            <Link href="/faq" className="hover:text-foreground hover:underline">
              자주 묻는 질문
            </Link>
            <span>|</span>
            <Link href="/support" className="hover:text-foreground hover:underline">
              문의하기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
