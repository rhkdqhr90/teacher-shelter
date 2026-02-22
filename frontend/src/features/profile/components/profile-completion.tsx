'use client';

import { useUser } from '@/stores/auth-store';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface CompletionItem {
  label: string;
  completed: boolean;
  href?: string;
}

export function ProfileCompletion() {
  const user = useUser();

  if (!user) return null;

  const items: CompletionItem[] = [
    {
      label: '이메일 인증',
      completed: !!user.isVerified,
      href: user.isVerified ? undefined : '/settings/verify-email',
    },
    {
      label: '프로필 이미지',
      completed: !!user.profileImage,
      href: user.profileImage ? undefined : '/settings/profile',
    },
    {
      label: '직종 선택',
      completed: !!user.jobType,
      href: user.jobType ? undefined : '/settings/profile',
    },
    {
      label: '경력 입력',
      completed: user.career !== undefined && user.career !== null,
      href: user.career !== undefined ? undefined : '/settings/profile',
    },
  ];

  const completedCount = items.filter((item) => item.completed).length;
  const percentage = Math.round((completedCount / items.length) * 100);

  // 100% 완성 시 숨김
  if (percentage === 100) return null;

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          프로필 완성도
        </h3>
        <span className="text-sm font-bold text-primary">{percentage}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Checklist */}
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-sm">
            {item.completed ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <Circle className="w-4 h-4 text-muted-foreground" />
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="text-primary hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span className={item.completed ? 'text-muted-foreground' : ''}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
