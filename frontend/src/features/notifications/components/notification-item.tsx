'use client';

import Link from 'next/link';
import { MessageCircle, Reply, Heart, AtSign, Trash2, UserPlus, FileCheck, CheckCircle, XCircle, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Notification, NotificationType } from '../notifications-api';
import { useMarkAsRead, useDeleteNotification } from '../hooks/use-notifications';

interface NotificationItemProps {
  notification: Notification;
}

const notificationConfig: Record<NotificationType, {
  icon: typeof MessageCircle;
  getMessage: (actor: string | null, postTitle: string | null) => string;
  color: string;
}> = {
  COMMENT: {
    icon: MessageCircle,
    getMessage: (actor, postTitle) =>
      `${actor || '누군가'}님이 "${postTitle || '게시글'}"에 댓글을 남겼습니다.`,
    color: 'text-blue-500',
  },
  REPLY: {
    icon: Reply,
    getMessage: (actor) =>
      `${actor || '누군가'}님이 회원님의 댓글에 답글을 남겼습니다.`,
    color: 'text-green-500',
  },
  LIKE: {
    icon: Heart,
    getMessage: (actor, postTitle) =>
      `${actor || '누군가'}님이 "${postTitle || '게시글'}"을 좋아합니다.`,
    color: 'text-red-500',
  },
  MENTION: {
    icon: AtSign,
    getMessage: (actor, postTitle) =>
      `${actor || '누군가'}님이 "${postTitle || '게시글'}"에서 회원님을 언급했습니다.`,
    color: 'text-purple-500',
  },
  NEW_APPLICATION: {
    icon: UserPlus,
    getMessage: (actor, postTitle) =>
      `${actor || '누군가'}님이 "${postTitle || '공고'}"에 지원했습니다.`,
    color: 'text-indigo-500',
  },
  APPLICATION_STATUS: {
    icon: FileCheck,
    getMessage: (_actor, postTitle) =>
      `"${postTitle || '공고'}" 지원 상태가 변경되었습니다.`,
    color: 'text-orange-500',
  },
  VERIFICATION_APPROVED: {
    icon: CheckCircle,
    getMessage: () => '교사 인증이 승인되었습니다.',
    color: 'text-green-500',
  },
  VERIFICATION_REJECTED: {
    icon: XCircle,
    getMessage: () => '교사 인증이 반려되었습니다. 다시 신청해주세요.',
    color: 'text-red-500',
  },
};

// 기본 설정 (알 수 없는 타입 대비)
const defaultConfig = {
  icon: Bell,
  getMessage: () => '새로운 알림이 있습니다.',
  color: 'text-gray-500',
};

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;
  return date.toLocaleDateString('ko-KR');
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const markAsRead = useMarkAsRead();
  const deleteNotification = useDeleteNotification();

  const config = notificationConfig[notification.type] || defaultConfig;
  const Icon = config.icon;
  const message = config.getMessage(
    notification.actor?.nickname ?? null,
    notification.post?.title ?? null
  );

  const handleClick = () => {
    if (!notification.isRead) {
      markAsRead.mutate(notification.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteNotification.mutate(notification.id);
  };

  // 게시글이 삭제된 경우 링크 비활성화
  const linkHref = notification.post
    ? notification.commentId
      ? `/posts/${notification.post.id}#comment-${notification.commentId}`
      : `/posts/${notification.post.id}`
    : null;

  const content = (
    <>
      {/* Icon */}
      <div className={cn('mt-0.5 flex-shrink-0', config.color)}>
        <Icon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm',
          !notification.isRead ? 'font-medium text-foreground' : 'text-foreground-muted'
        )}>
          {message}
          {!notification.post && (
            <span className="text-foreground-muted"> (삭제됨)</span>
          )}
        </p>
        <p className="text-xs text-foreground-muted mt-1">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>

      {/* Unread indicator & Delete button */}
      <div className="flex items-center gap-2">
        {!notification.isRead && (
          <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
        )}
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-all"
          aria-label="알림 삭제"
        >
          <Trash2 className="h-4 w-4 text-foreground-muted hover:text-destructive" />
        </button>
      </div>
    </>
  );

  const containerClass = cn(
    'flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors border-b border-border group',
    !notification.isRead && 'bg-primary/5'
  );

  // 링크가 없는 경우 div로 렌더링
  if (!linkHref) {
    return (
      <div onClick={handleClick} className={cn(containerClass, 'cursor-default')}>
        {content}
      </div>
    );
  }

  return (
    <Link href={linkHref} onClick={handleClick} className={containerClass}>
      {content}
    </Link>
  );
}
