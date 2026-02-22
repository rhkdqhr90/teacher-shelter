'use client';

import { MessageCircle, Loader2 } from 'lucide-react';
import { CommentListSkeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useComments, useCreateComment } from '../hooks/use-comments';
import { useIsAuthenticated, useUser } from '@/stores/auth-store';
import { MentionTextarea, type MentionUser } from '@/features/mentions';
import { CommentItem } from './comment-item';

interface CommentSectionProps {
  postId: string;
  commentCount: number;
}

export function CommentSection({ postId, commentCount }: CommentSectionProps) {
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();
  const { data, isLoading } = useComments(postId);
  const createComment = useCreateComment(postId);

  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [mentionedUser, setMentionedUser] = useState<MentionUser | null>(null);
  const [replyMentionedUser, setReplyMentionedUser] = useState<MentionUser | null>(null);

  const canComment = isAuthenticated && user?.isVerified;

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    if (mentionedUser && !newContent.includes(`@${mentionedUser.nickname}`)) {
      setMentionedUser(null);
    }
  };

  const handleReplyContentChange = (newContent: string) => {
    setReplyContent(newContent);
    if (replyMentionedUser && !newContent.includes(`@${replyMentionedUser.nickname}`)) {
      setReplyMentionedUser(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    await createComment.mutateAsync({
      content: content.trim(),
      ...(mentionedUser && { mentionedUserId: mentionedUser.id }),
    });
    setContent('');
    setMentionedUser(null);
  };

  const handleReply = async (parentCommentId: string) => {
    if (!replyContent.trim()) return;

    await createComment.mutateAsync({
      content: replyContent.trim(),
      parentCommentId,
      ...(replyMentionedUser && { mentionedUserId: replyMentionedUser.id }),
    });
    setReplyContent('');
    setReplyTo(null);
    setReplyMentionedUser(null);
  };

  return (
    <div className="bg-card rounded-lg border p-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
        <MessageCircle className="w-5 h-5" />
        댓글 {commentCount}
      </h2>

      {canComment ? (
        <CommentForm
          content={content}
          onChange={handleContentChange}
          onMentionSelect={setMentionedUser}
          onSubmit={handleSubmit}
          isSubmitting={createComment.isPending}
        />
      ) : (
        <LoginPrompt isAuthenticated={isAuthenticated} />
      )}

      <CommentList
        comments={data?.data}
        isLoading={isLoading}
        postId={postId}
        replyTo={replyTo}
        setReplyTo={setReplyTo}
        replyContent={replyContent}
        setReplyContent={handleReplyContentChange}
        onReply={handleReply}
        onReplyMentionSelect={setReplyMentionedUser}
        isReplying={createComment.isPending}
        canReply={canComment}
        canReport={isAuthenticated}
        currentUserId={user?.id}
      />
    </div>
  );
}

interface CommentFormProps {
  content: string;
  onChange: (content: string) => void;
  onMentionSelect: (user: MentionUser) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

function CommentForm({ content, onChange, onMentionSelect, onSubmit, isSubmitting }: CommentFormProps) {
  return (
    <form onSubmit={onSubmit} className="mb-6">
      <MentionTextarea
        value={content}
        onChange={onChange}
        onMentionSelect={onMentionSelect}
        placeholder="댓글을 입력하세요 (@로 사용자 멘션)"
        rows={3}
        className="mb-2"
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isSubmitting || !content.trim()}>
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : '댓글 작성'}
        </Button>
      </div>
    </form>
  );
}

function LoginPrompt({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <div className="mb-6 p-4 bg-muted rounded-md text-center">
      {!isAuthenticated ? (
        <p className="text-sm text-muted-foreground">
          댓글을 작성하려면{' '}
          <Link href="/login" className="text-primary hover:underline">
            로그인
          </Link>
          이 필요합니다.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          댓글을 작성하려면{' '}
          <Link href="/register" className="text-primary hover:underline">
            이메일 인증
          </Link>
          이 필요합니다.
        </p>
      )}
    </div>
  );
}

interface CommentListProps {
  comments?: import('../services/comments-api').Comment[];
  isLoading: boolean;
  postId: string;
  replyTo: string | null;
  setReplyTo: (id: string | null) => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
  onReply: (parentId: string) => void;
  onReplyMentionSelect: (user: MentionUser) => void;
  isReplying: boolean;
  canReply?: boolean;
  canReport?: boolean;
  currentUserId?: string;
}

function CommentList({
  comments,
  isLoading,
  postId,
  replyTo,
  setReplyTo,
  replyContent,
  setReplyContent,
  onReply,
  onReplyMentionSelect,
  isReplying,
  canReply,
  canReport,
  currentUserId,
}: CommentListProps) {
  if (isLoading) {
    return <CommentListSkeleton count={3} />;
  }

  if (!comments || comments.length === 0) {
    return (
      <p className="text-center py-8 text-muted-foreground">
        아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          postId={postId}
          replyTo={replyTo}
          setReplyTo={setReplyTo}
          replyContent={replyContent}
          setReplyContent={setReplyContent}
          onReply={onReply}
          onReplyMentionSelect={onReplyMentionSelect}
          isReplying={isReplying}
          canReply={canReply ?? false}
          canReport={canReport ?? false}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}
