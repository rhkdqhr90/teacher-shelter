'use client';

import { Reply, MoreHorizontal, Flag, Pencil, Trash2, Check, X, Loader2 } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { ReportModal } from '@/features/reports/components/report-modal';
import { MentionTextarea, type MentionUser } from '@/features/mentions';
import { JOB_TYPE_LABELS } from '@/features/profile/types';
import { formatTimeAgo, cn } from '@/lib/utils';
import { SERVER_URL } from '@/lib/constants';
import { useClickOutside } from '@/hooks/use-click-outside';
import { useUpdateComment, useDeleteComment } from '../hooks/use-comments';
import { useToast } from '@/hooks/use-toast';
import type { Comment } from '../services/comments-api';

export interface CommentItemProps {
  comment: Comment;
  postId: string;
  replyTo: string | null;
  setReplyTo: (id: string | null) => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
  onReply: (parentId: string) => void;
  onReplyMentionSelect?: (user: MentionUser) => void;
  isReplying: boolean;
  isReply?: boolean;
  canReply?: boolean;
  canReport?: boolean;
  currentUserId?: string;
}

export function CommentItem({
  comment,
  postId,
  replyTo,
  setReplyTo,
  replyContent,
  setReplyContent,
  onReply,
  onReplyMentionSelect,
  isReplying,
  isReply = false,
  canReply = false,
  canReport = false,
  currentUserId,
}: CommentItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const updateComment = useUpdateComment(postId);
  const deleteComment = useDeleteComment(postId);
  const { toast } = useToast();

  const timeAgo = formatTimeAgo(comment.createdAt);

  const authorInfo = comment.author.jobType
    ? `${JOB_TYPE_LABELS[comment.author.jobType] || ''}${comment.author.career ? ` ${comment.author.career}년차` : ''}`
    : '';

  const isOwnComment = currentUserId === comment.author.id;
  const isMentionedToMe = currentUserId && comment.mentionedUser?.id === currentUserId;

  const closeMenu = useCallback(() => setShowMenu(false), []);
  useClickOutside(menuRef, closeMenu, showMenu);

  const handleEdit = async () => {
    if (editContent.trim().length === 0) return;
    try {
      await updateComment.mutateAsync({ commentId: comment.id, content: editContent.trim() });
      setIsEditing(false);
      toast.success('댓글이 수정되었습니다');
    } catch {
      toast.error('댓글 수정 실패', '댓글을 수정할 수 없습니다. 다시 시도해주세요.');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComment.mutateAsync(comment.id);
      setShowDeleteConfirm(false);
      toast.success('댓글이 삭제되었습니다');
    } catch {
      toast.error('댓글 삭제 실패', '댓글을 삭제할 수 없습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className={`${isReply ? 'ml-8 pl-4 border-l-2' : ''}`} id={`comment-${comment.id}`}>
      <div className="flex gap-3">
        <Avatar
          name={comment.author.nickname}
          src={comment.author.profileImage ? `${SERVER_URL}${comment.author.profileImage}` : undefined}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <CommentHeader
            author={comment.author}
            authorInfo={authorInfo}
            timeAgo={timeAgo}
            canReport={canReport}
            isOwnComment={isOwnComment}
            showMenu={showMenu}
            setShowMenu={setShowMenu}
            setShowReportModal={setShowReportModal}
            onEdit={() => {
              setIsEditing(true);
              setShowMenu(false);
            }}
            onDelete={() => {
              setShowDeleteConfirm(true);
              setShowMenu(false);
            }}
            menuRef={menuRef}
          />

          {/* 수정 모드 */}
          {isEditing ? (
            <div className="mt-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border rounded-md text-sm resize-none min-h-[60px]"
                rows={2}
              />
              <div className="flex gap-2 justify-end mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  취소
                </Button>
                <Button
                  size="sm"
                  onClick={handleEdit}
                  disabled={updateComment.isPending || !editContent.trim()}
                >
                  {updateComment.isPending ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 mr-1" />
                  )}
                  저장
                </Button>
              </div>
            </div>
          ) : (
            <CommentContent
              content={comment.content}
              mentionedUser={comment.mentionedUser}
              isMentionedToMe={!!isMentionedToMe}
            />
          )}

          {/* 삭제 확인 */}
          {showDeleteConfirm && (
            <div className="mt-2 p-3 bg-destructive/10 rounded-md">
              <p className="text-sm text-destructive mb-2">이 댓글을 삭제하시겠습니까?</p>
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
                  disabled={deleteComment.isPending}
                >
                  {deleteComment.isPending ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : null}
                  삭제
                </Button>
              </div>
            </div>
          )}
          {!isReply && canReply && (
            <ReplyButton
              isActive={replyTo === comment.id}
              onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
            />
          )}
          {replyTo === comment.id && (
            <ReplyForm
              content={replyContent}
              onChange={setReplyContent}
              onMentionSelect={onReplyMentionSelect}
              onSubmit={() => onReply(comment.id)}
              onCancel={() => setReplyTo(null)}
              isSubmitting={isReplying}
            />
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              replyTo={replyTo}
              setReplyTo={setReplyTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              onReply={onReply}
              onReplyMentionSelect={onReplyMentionSelect}
              isReplying={isReplying}
              isReply
              canReply={canReply}
              canReport={canReport}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="COMMENT"
        targetId={comment.id}
        targetTitle={comment.content.slice(0, 50) + (comment.content.length > 50 ? '...' : '')}
      />
    </div>
  );
}

interface CommentHeaderProps {
  author: Comment['author'];
  authorInfo: string;
  timeAgo: string;
  canReport: boolean;
  isOwnComment: boolean;
  showMenu: boolean;
  setShowMenu: (show: boolean) => void;
  setShowReportModal: (show: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
}

function CommentHeader({
  author,
  authorInfo,
  timeAgo,
  canReport,
  isOwnComment,
  showMenu,
  setShowMenu,
  setShowReportModal,
  onEdit,
  onDelete,
  menuRef,
}: CommentHeaderProps) {
  const showMoreMenu = canReport || isOwnComment;

  return (
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center gap-2">
        <span className="font-medium text-sm">
          {author.nickname}
          {author.isVerified && (
            <span className="ml-1 text-green-600" title="인증된 교사">
              🏅
            </span>
          )}
        </span>
        {authorInfo && (
          <span className="text-xs text-muted-foreground">{authorInfo}</span>
        )}
        <span className="text-xs text-muted-foreground">{timeAgo}</span>
      </div>

      {showMoreMenu && (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="더보기"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 py-1 bg-card border rounded-md shadow-lg z-10 min-w-[100px]">
              {/* 본인 댓글: 수정/삭제 */}
              {isOwnComment && (
                <>
                  <button
                    onClick={onEdit}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                    수정
                  </button>
                  <button
                    onClick={onDelete}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    삭제
                  </button>
                </>
              )}
              {/* 타인 댓글: 신고 */}
              {canReport && !isOwnComment && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowReportModal(true);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-muted transition-colors"
                >
                  <Flag className="w-4 h-4" />
                  신고
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface CommentContentProps {
  content: string;
  mentionedUser?: { id: string; nickname: string };
  isMentionedToMe?: boolean;
}

function CommentContent({ content, mentionedUser, isMentionedToMe }: CommentContentProps) {
  // content에서 멘션 부분 제거 (중복 방지)
  let displayContent = content;
  if (mentionedUser) {
    // @닉네임 패턴 제거 (앞뒤 공백 포함)
    const escapedNickname = mentionedUser.nickname.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const mentionPattern = new RegExp(`^@${escapedNickname}\\s*`, 'i');
    displayContent = content.replace(mentionPattern, '');
  }

  return (
    <p className="text-sm whitespace-pre-wrap">
      {mentionedUser && (
        <span
          className={cn(
            'font-medium',
            isMentionedToMe
              ? 'text-accent bg-accent/10 px-1 rounded'
              : 'text-primary'
          )}
        >
          @{mentionedUser.nickname}{' '}
        </span>
      )}
      {displayContent}
    </p>
  );
}

interface ReplyButtonProps {
  isActive: boolean;
  onClick: () => void;
}

function ReplyButton({ isActive, onClick }: ReplyButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-2"
    >
      <Reply className="w-3 h-3" />
      답글
    </button>
  );
}

interface ReplyFormProps {
  content: string;
  onChange: (content: string) => void;
  onMentionSelect?: (user: MentionUser) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

function ReplyForm({
  content,
  onChange,
  onMentionSelect,
  onSubmit,
  onCancel,
  isSubmitting,
}: ReplyFormProps) {
  return (
    <div className="mt-3">
      <MentionTextarea
        value={content}
        onChange={onChange}
        onMentionSelect={onMentionSelect}
        placeholder="답글을 입력하세요 (@로 사용자 멘션)"
        rows={2}
        className="mb-2"
      />
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          취소
        </Button>
        <Button
          size="sm"
          onClick={onSubmit}
          disabled={isSubmitting || !content.trim()}
        >
          {isSubmitting ? <Spinner size="sm" /> : '답글 작성'}
        </Button>
      </div>
    </div>
  );
}
