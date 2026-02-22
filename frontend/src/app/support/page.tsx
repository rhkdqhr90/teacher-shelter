'use client';

import Link from 'next/link';
import { Mail, MessageSquare, Send, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MainLayout } from '@/components/layout';
import { api } from '@/lib/api-client';

const inquiryTypes = [
  { value: 'GENERAL', label: '일반 문의' },
  { value: 'ACCOUNT', label: '계정 관련' },
  { value: 'REPORT', label: '신고/불편 사항' },
  { value: 'SUGGESTION', label: '서비스 제안' },
  { value: 'PARTNERSHIP', label: '제휴/협력 문의' },
  { value: 'OTHER', label: '기타' },
];

export default function SupportPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const type = formData.get('type') as string;
    const email = formData.get('email') as string;
    const subject = formData.get('subject') as string;
    const content = formData.get('content') as string;

    try {
      await api.post('/inquiries', {
        type,
        email,
        subject,
        content,
      });
      setIsSubmitted(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '문의 접수에 실패했습니다. 잠시 후 다시 시도해주세요.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <MainLayout showSidebar={false}>
        <div className="mx-auto max-w-2xl py-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="mb-4 text-2xl font-bold">문의가 접수되었습니다</h1>
          <p className="mb-8 text-muted-foreground">
            빠른 시일 내에 입력하신 이메일로 답변 드리겠습니다.
            <br />
            영업일 기준 1-3일 내에 답변을 받으실 수 있습니다.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/">홈으로 돌아가기</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/faq">자주 묻는 질문 보기</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showSidebar={false}>
      <div className="mx-auto max-w-2xl">
        {/* 페이지 타이틀 */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">문의하기</h1>
            <p className="text-sm text-muted-foreground">궁금한 점이나 불편한 사항을 알려주세요</p>
          </div>
        </div>

        {/* 안내 */}
        <div className="mb-8 rounded-lg bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            문의 전{' '}
            <Link href="/faq" className="text-primary hover:underline">
              자주 묻는 질문
            </Link>
            을 확인해 보세요. 원하는 답변을 빠르게 찾으실 수 있습니다.
          </p>
        </div>

        {/* 문의 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="type" className="mb-2 block text-sm font-medium">
              문의 유형 <span className="text-destructive">*</span>
            </label>
            <select
              id="type"
              name="type"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">선택해주세요</option>
              {inquiryTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              이메일 <span className="text-destructive">*</span>
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="답변 받으실 이메일 주소"
              required
            />
            <p className="mt-1 text-xs text-muted-foreground">
              답변은 입력하신 이메일로 발송됩니다
            </p>
          </div>

          <div>
            <label htmlFor="subject" className="mb-2 block text-sm font-medium">
              제목 <span className="text-destructive">*</span>
            </label>
            <Input
              id="subject"
              name="subject"
              type="text"
              placeholder="문의 제목을 입력해주세요"
              required
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="content" className="mb-2 block text-sm font-medium">
              내용 <span className="text-destructive">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              rows={8}
              placeholder="문의 내용을 상세히 작성해주세요. 문제 상황, 기기/브라우저 정보 등을 함께 작성해주시면 더 빠른 답변이 가능합니다."
              required
              minLength={10}
              maxLength={2000}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              최소 10자 이상 작성해주세요
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                접수 중...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                문의 접수하기
              </>
            )}
          </Button>
        </form>

        {/* 추가 연락처 */}
        <div className="mt-12 rounded-lg border p-6">
          <h2 className="mb-4 font-semibold">기타 연락처</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">이메일:</span>
              <a href="mailto:support@teacherlounge.co.kr" className="text-primary hover:underline">
                support@teacherlounge.co.kr
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              * 영업시간: 평일 09:00 - 18:00 (주말 및 공휴일 휴무)
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
