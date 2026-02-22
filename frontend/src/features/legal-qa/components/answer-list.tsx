'use client';

import { Scale, MessageSquare } from 'lucide-react';
import { useAnswers } from '../hooks/use-answers';
import { AnswerItem } from './answer-item';
import { AnswerForm } from './answer-form';
import { useUser } from '@/stores/auth-store';

interface AnswerListProps {
  postId: string;
  postAuthorId: string | null;
}

export function AnswerList({ postId, postAuthorId }: AnswerListProps) {
  const user = useUser();
  const { data: answers, isLoading, error } = useAnswers(postId);

  const isExpert = user?.isExpert ?? false;
  const isPostAuthor = user?.id === postAuthorId;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        답변을 불러오는데 실패했습니다.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <Scale className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">전문가 답변</h2>
        {answers && answers.length > 0 && (
          <span className="text-sm text-muted-foreground">
            ({answers.length}개)
          </span>
        )}
      </div>

      {/* 답변 목록 */}
      {answers && answers.length > 0 ? (
        <div className="space-y-4">
          {answers.map((answer) => (
            <AnswerItem
              key={answer.id}
              answer={answer}
              postId={postId}
              isPostAuthor={isPostAuthor}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <MessageSquare className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">
            아직 전문가 답변이 없습니다.
          </p>
          {isExpert && (
            <p className="text-sm text-primary mt-2">
              전문가님, 첫 번째 답변을 남겨주세요!
            </p>
          )}
        </div>
      )}

      {/* 답변 작성 폼 (전문가만) */}
      {isExpert && (
        <div className="mt-8 pt-6 border-t">
          <h3 className="text-base font-medium mb-4">답변 작성</h3>
          <AnswerForm postId={postId} />
        </div>
      )}

      {/* 비전문가 안내 */}
      {user && !isExpert && (
        <div className="mt-8 pt-6 border-t">
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              전문가 인증을 받으시면 답변을 작성할 수 있습니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
