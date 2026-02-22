'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PostEditor } from '@/components/editor';
import { Loader2, Send } from 'lucide-react';
import { useCreateAnswer } from '../hooks/use-answers';

interface AnswerFormProps {
  postId: string;
  onSuccess?: () => void;
}

export function AnswerForm({ postId, onSuccess }: AnswerFormProps) {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const createAnswer = useCreateAnswer(postId);

  // HTML 태그 제거하여 순수 텍스트 길이 계산 (정규식 사용 - XSS 안전)
  const getTextLength = (html: string) => {
    // HTML 태그 제거
    const text = html.replace(/<[^>]*>/g, '');
    // HTML 엔티티 디코딩 (&nbsp; -> 공백 등)
    const decoded = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"');
    return decoded.length;
  };

  const textLength = typeof window !== 'undefined' ? getTextLength(content) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const length = getTextLength(content);
    if (length < 10) {
      setError('답변은 최소 10자 이상 작성해주세요.');
      return;
    }
    if (length > 10000) {
      setError('답변은 최대 10,000자까지 작성 가능합니다.');
      return;
    }

    try {
      await createAnswer.mutateAsync({ content });
      setContent('');
      onSuccess?.();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '답변 작성에 실패했습니다.';
      setError(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          {error}
        </div>
      )}

      <div>
        <PostEditor
          content={content}
          onChange={setContent}
          placeholder="전문가로서 답변을 작성해주세요..."
        />
        <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
          <span>최소 10자 이상</span>
          <span>{textLength}/10000</span>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={createAnswer.isPending}>
          {createAnswer.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              답변 등록 중...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              답변 등록
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
