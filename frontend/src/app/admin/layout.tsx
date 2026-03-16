'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { BarChart3, Flag, Users, FileText, ChevronLeft, ShieldCheck, Bell, Image, Shield, MessageSquare, Sparkles } from 'lucide-react';
import { useUser, useIsAdmin } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { AdminMobileNav } from '@/features/admin/components/admin-mobile-nav';

const adminNavItems = [
  { href: '/admin', label: '대시보드', icon: BarChart3 },
  { href: '/admin/reports', label: '신고 관리', icon: Flag },
  { href: '/admin/verifications', label: '인증 관리', icon: ShieldCheck },
  { href: '/admin/inquiries', label: '문의 관리', icon: MessageSquare },
  { href: '/admin/users', label: '사용자 관리', icon: Users },
  { href: '/admin/posts', label: '게시글 관리', icon: FileText },
  { href: '/admin/auto-content', label: '자동 콘텐츠', icon: Sparkles },
  { href: '/admin/announcements', label: '공지사항 관리', icon: Bell },
  { href: '/admin/banners', label: '배너 관리', icon: Image },
  { href: '/admin/privacy', label: '개인정보 관리', icon: Shield },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useUser();
  const isAdmin = useIsAdmin();

  useEffect(() => {
    // 로그인 안됨 또는 관리자 아님
    if (user && !isAdmin) {
      router.replace('/');
    }
  }, [user, isAdmin, router]);

  // 로딩 또는 권한 없음
  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">권한 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 상단 헤더 */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            {/* 모바일 메뉴 버튼 */}
            <AdminMobileNav />
            <Link href="/dashboard" className="hidden lg:flex">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4 mr-1" />
                돌아가기
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">관리자</h1>
          </div>
          <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
        </div>
      </header>

      <div className="container py-6">
        <div className="flex gap-6">
          {/* 사이드바 - 데스크탑만 */}
          <aside className="w-48 shrink-0 hidden lg:block">
            <nav className="space-y-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* 메인 콘텐츠 */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
