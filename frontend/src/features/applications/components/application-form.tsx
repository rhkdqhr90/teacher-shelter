'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, CheckCircle } from 'lucide-react';
import { useCreateApplication, useCheckApplied } from '../hooks/use-applications';
import { useToast } from '@/hooks/use-toast';

interface ApplicationFormProps {
  postId: string;
  isAuthenticated: boolean;
  isRecruiting: boolean;
}

export function ApplicationForm({
  postId,
  isAuthenticated,
  isRecruiting,
}: ApplicationFormProps) {
  const { toast } = useToast();
  const createApplication = useCreateApplication();
  const { data: checkData, isLoading: isChecking } = useCheckApplied(
    postId,
    isAuthenticated
  );

  const [showForm, setShowForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const hasApplied = checkData?.applied || false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createApplication.mutateAsync({
        postId,
        coverLetter: coverLetter || undefined,
        contactPhone: contactPhone || undefined,
        contactEmail: contactEmail || undefined,
      });
      toast.success('지원이 완료되었습니다');
      setShowForm(false);
    } catch (error: any) {
      toast.error('지원 실패', error?.response?.data?.message || '지원에 실패했습니다.');
    }
  };

  if (isChecking) {
    return (
      <div className="p-4 bg-muted/30 rounded-lg border border-border flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-4 bg-muted/30 rounded-lg border border-border text-center">
        <p className="text-sm text-muted-foreground">
          지원하려면 로그인이 필요합니다.
        </p>
      </div>
    );
  }

  if (!isRecruiting) {
    return (
      <div className="p-4 bg-muted/30 rounded-lg border border-border text-center">
        <p className="text-sm text-muted-foreground">
          마감된 공고입니다.
        </p>
      </div>
    );
  }

  if (hasApplied) {
    return (
      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
        <div>
          <p className="font-medium text-green-700 dark:text-green-300">지원 완료</p>
          <p className="text-sm text-green-600 dark:text-green-400">
            이미 지원한 공고입니다. 마이페이지에서 지원 현황을 확인하세요.
          </p>
        </div>
      </div>
    );
  }

  if (!showForm) {
    return (
      <Button
        onClick={() => setShowForm(true)}
        className="w-full"
        size="lg"
      >
        <Send className="w-4 h-4 mr-2" />
        지원하기
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-muted/30 rounded-lg border border-border space-y-4">
      <h4 className="font-medium">지원서 작성</h4>

      <div>
        <label className="block text-sm font-medium mb-2">자기소개 (선택)</label>
        <textarea
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          placeholder="간단한 자기소개나 지원 동기를 작성해주세요"
          className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px] resize-y"
          maxLength={3000}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">연락처 (선택)</label>
          <Input
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="010-0000-0000"
            maxLength={20}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">이메일 (선택)</label>
          <Input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="example@email.com"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowForm(false)}
          className="flex-1"
        >
          취소
        </Button>
        <Button
          type="submit"
          disabled={createApplication.isPending}
          className="flex-1"
        >
          {createApplication.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              지원 중...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              지원하기
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
