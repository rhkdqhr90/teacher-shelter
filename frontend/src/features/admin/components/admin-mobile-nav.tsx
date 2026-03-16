'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, BarChart3, Flag, Users, FileText, ShieldCheck, Bell, Image, Shield, MessageSquare, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

export function AdminMobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // 메뉴 열릴 때 스크롤 잠금
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* 햄버거 버튼 */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden"
        onClick={() => setIsOpen(true)}
        aria-label="메뉴 열기"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* 오버레이 & 메뉴 */}
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-overlay-show"
            onClick={() => setIsOpen(false)}
          />

          {/* 슬라이드 메뉴 */}
          <div className="fixed inset-y-0 left-0 w-64 bg-background border-r z-50 lg:hidden animate-slide-in-from-left">
            {/* 메뉴 헤더 */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">관리자 메뉴</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                aria-label="메뉴 닫기"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* 네비게이션 링크 */}
            <nav className="p-4 space-y-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
