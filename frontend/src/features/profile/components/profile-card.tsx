'use client';

import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Settings, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { SERVER_URL } from '@/lib/constants';
import { useProfile } from '../hooks/use-profile';
import { JOB_TYPE_LABELS } from '../types';

export function ProfileCard() {
  const { data: profile, isLoading, error } = useProfile();

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border p-6 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-muted" />
          <div className="flex-1">
            <div className="h-5 bg-muted rounded w-24 mb-2" />
            <div className="h-4 bg-muted rounded w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="bg-card rounded-lg border p-6 text-center">
        <p className="text-muted-foreground">프로필을 불러올 수 없습니다.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/login">로그인하기</Link>
        </Button>
      </div>
    );
  }

  const joinedAgo = formatDistanceToNow(new Date(profile.createdAt), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center overflow-hidden">
            {profile.profileImage ? (
              <Image
                src={`${SERVER_URL}${profile.profileImage}`}
                alt={profile.nickname}
                fill
                sizes="64px"
                className="object-cover"
                priority
              />
            ) : (
              <User className="w-8 h-8 text-primary" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              {profile.nickname}
              {profile.isVerified && (
                <span className="text-yellow-500" title="인증된 교사">🏅</span>
              )}
            </h2>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            {profile.jobType && (
              <p className="text-sm text-muted-foreground mt-1">
                {JOB_TYPE_LABELS[profile.jobType] || profile.jobType}
                {profile.career != null && profile.career > 0 && ` · ${profile.career}년차`}
              </p>
            )}
          </div>
        </div>
        <Button asChild variant="ghost" size="icon">
          <Link href="/profile/edit">
            <Settings className="w-5 h-5" />
          </Link>
        </Button>
      </div>

      <div className="mt-6 pt-4 border-t text-sm text-muted-foreground">
        가입일: {joinedAgo}
      </div>
    </div>
  );
}
