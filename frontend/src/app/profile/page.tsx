'use client';

import { ProfileCard } from '@/features/profile/components';
import { Key, LogOut, FileText, MessageSquare, ChevronRight, Bookmark, Flag, LayoutDashboard, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth-api';
import { MainLayout } from '@/components/layout/main-layout';

export default function ProfilePage() {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <MainLayout showSidebar={false}>
      {/* Content */}
      <div className="max-w-xl mx-auto space-y-6">
        {/* Profile Card */}
        <ProfileCard />

        {/* 대시보드 바로가기 */}
        <Link
          href="/dashboard"
          className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-5 h-5 text-primary" />
            <span className="font-medium">대시보드로 이동</span>
          </div>
          <ChevronRight className="w-5 h-5 text-primary" />
        </Link>

        {/* My Activity */}
        <div className="bg-card rounded-lg border divide-y divide-border">
          <h3 className="px-4 py-3 text-sm font-semibold text-foreground-muted">
            내 활동
          </h3>
          <Link
            href="/profile/posts"
            className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-foreground-muted" />
              <span>내가 쓴 글</span>
            </div>
            <ChevronRight className="w-5 h-5 text-foreground-muted" />
          </Link>
          <Link
            href="/profile/comments"
            className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-foreground-muted" />
              <span>내가 쓴 댓글</span>
            </div>
            <ChevronRight className="w-5 h-5 text-foreground-muted" />
          </Link>
          <Link
            href="/profile/bookmarks"
            className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Bookmark className="w-5 h-5 text-foreground-muted" />
              <span>북마크</span>
            </div>
            <ChevronRight className="w-5 h-5 text-foreground-muted" />
          </Link>
          <Link
            href="/profile/reports"
            className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Flag className="w-5 h-5 text-foreground-muted" />
              <span>신고 내역</span>
            </div>
            <ChevronRight className="w-5 h-5 text-foreground-muted" />
          </Link>
        </div>

        {/* Verification */}
        <div className="bg-card rounded-lg border divide-y divide-border">
          <h3 className="px-4 py-3 text-sm font-semibold text-foreground-muted">
            인증
          </h3>
          <Link
            href="/profile/verification"
            className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-foreground-muted" />
              <span>신분 인증</span>
            </div>
            <ChevronRight className="w-5 h-5 text-foreground-muted" />
          </Link>
        </div>

        {/* Settings */}
        <div className="bg-card rounded-lg border divide-y divide-border">
          <h3 className="px-4 py-3 text-sm font-semibold text-foreground-muted">
            설정
          </h3>
          <Link
            href="/profile/password"
            className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-foreground-muted" />
              <span>비밀번호 변경</span>
            </div>
            <ChevronRight className="w-5 h-5 text-foreground-muted" />
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-4 text-destructive hover:bg-destructive/5 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>로그아웃</span>
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
