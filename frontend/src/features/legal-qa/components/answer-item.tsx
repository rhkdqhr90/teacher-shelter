'use client';

import { useState } from 'react';
import { formatDistanceToNow, isValid } from 'date-fns';
import { ko } from 'date-fns/locale';
import DOMPurify from 'dompurify';
import { Award, Edit2, Trash2, Check, X, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PostEditor } from '@/components/editor';
import { useUser } from '@/stores/auth-store';
import { useUpdateAnswer, useDeleteAnswer, useSelectBestAnswer } from '../hooks/use-answers';
import type { Answer } from '../types';
import { EXPERT_TYPE_LABELS } from '../types';
import { cn } from '@/lib/utils';
import { SERVER_URL } from '@/lib/constants';

// DOMPurify 설정 - XSS 방지
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
};

interface AnswerItemProps {
  answer: Answer;
  postId: string;
  isPostAuthor: boolean;
}

export function AnswerItem({ answer, postId, isPostAuthor }: AnswerItemProps) {
  const user = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(answer.content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAnswer = useUpdateAnswer(postId);
  const deleteAnswer = useDeleteAnswer(postId);
  const selectBest = useSelectBestAnswer(postId);

  const isAuthor = user?.id === answer.authorId;

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

  const handleUpdate = async () => {
    const length = getTextLength(editContent);
    if (length < 10) {
      setError('답변은 최소 10자 이상이어야 합니다.');
      return;
    }
    if (length > 10000) {
      setError('답변은 최대 10,000자까지 작성 가능합니다.');
      return;
    }
    setError(null);

    try {
      await updateAnswer.mutateAsync({
        answerId: answer.id,
        data: { content: editContent },
      });
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '답변 수정에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    setError(null);
    try {
      await deleteAnswer.mutateAsync(answer.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : '답변 삭제에 실패했습니다.');
      setShowDeleteConfirm(false);
    }
  };

  const handleSelectBest = async () => {
    setError(null);
    try {
      await selectBest.mutateAsync(answer.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : '베스트 답변 선택에 실패했습니다.');
    }
  };

  return (
    <div
      className={cn(
        "p-5 rounded-lg border",
        answer.isBest && "border-primary bg-primary/5"
      )}
    >
      {/* 베스트 답변 배지 */}
      {answer.isBest && (
        <div className="flex items-center gap-2 mb-3 text-primary">
          <Award className="h-5 w-5" />
          <span className="font-semibold text-sm">베스트 답변</span>
        </div>
      )}

      {/* 작성자 정보 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
            {answer.author.profileImage ? (
              <img
                src={`${SERVER_URL}${answer.author.profileImage}`}
                alt={answer.author.nickname}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <User className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{answer.author.nickname}</span>
              {answer.author.isExpert && answer.author.expertType && (
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
                  {EXPERT_TYPE_LABELS[answer.author.expertType] || '전문가'}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {(() => {
                const date = new Date(answer.createdAt);
                return isValid(date) ? formatDistanceToNow(date, { addSuffix: true, locale: ko }) : '알 수 없음';
              })()}
            </span>
          </div>
        </div>

        {/* 작성자 액션 */}
        {isAuthor && !isEditing && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        )}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          {error}
        </div>
      )}

      {/* 내용 */}
      {isEditing ? (
        <div className="space-y-3">
          <PostEditor
            content={editContent}
            onChange={setEditContent}
            placeholder="답변을 수정해주세요..."
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              {getTextLength(editContent)}/10000
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(answer.content);
                  setError(null);
                }}
              >
                <X className="h-4 w-4 mr-1" />
                취소
              </Button>
              <Button
                size="sm"
                onClick={handleUpdate}
                disabled={updateAnswer.isPending}
              >
                {updateAnswer.isPending ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-1" />
                )}
                저장
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(answer.content, SANITIZE_CONFIG) }}
        />
      )}

      {/* 삭제 확인 */}
      {showDeleteConfirm && (
        <div className="mt-4 p-3 bg-destructive/10 rounded-lg">
          <p className="text-sm text-destructive mb-3">정말 이 답변을 삭제하시겠습니까?</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleteAnswer.isPending}
            >
              {deleteAnswer.isPending ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : null}
              삭제
            </Button>
          </div>
        </div>
      )}

      {/* 베스트 선택 버튼 (질문 작성자만, 아직 베스트가 아닌 경우) */}
      {isPostAuthor && !answer.isBest && !isEditing && (
        <div className="mt-4 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectBest}
            disabled={selectBest.isPending}
            className="text-primary border-primary hover:bg-primary/10"
          >
            {selectBest.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Award className="h-4 w-4 mr-2" />
            )}
            베스트 답변으로 선택
          </Button>
        </div>
      )}
    </div>
  );
}
