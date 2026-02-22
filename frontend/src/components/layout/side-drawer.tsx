'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, FileText, MessageSquare, Lightbulb, Megaphone, Scale, Settings, Laugh, Briefcase, BookOpen, Award, Calendar, Users, Baby, Heart, School, Bell, HelpCircle, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';

interface CategoryItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  category?: string;
  isSection?: boolean;
}

const categories: CategoryItem[] = [
  { href: '/', icon: <FileText className="h-5 w-5" />, label: '전체글' },
  // 커뮤니티
  { href: '#', icon: null, label: '커뮤니티', isSection: true },
  { href: '/posts?category=FREE', icon: <MessageSquare className="h-5 w-5" />, label: '자유게시판', category: 'FREE' },
  { href: '/posts?category=ANONYMOUS', icon: <MessageSquare className="h-5 w-5" />, label: '익명게시판', category: 'ANONYMOUS' },
  { href: '/posts?category=HUMOR', icon: <Laugh className="h-5 w-5" />, label: '유머', category: 'HUMOR' },
  // 정보공유
  { href: '#', icon: null, label: '정보공유', isSection: true },
  { href: '/posts?category=INFO', icon: <Megaphone className="h-5 w-5" />, label: '정보공유', category: 'INFO' },
  { href: '/posts?category=KNOWHOW', icon: <Lightbulb className="h-5 w-5" />, label: '노하우', category: 'KNOWHOW' },
  { href: '/posts?category=CLASS_MATERIAL', icon: <BookOpen className="h-5 w-5" />, label: '수업자료', category: 'CLASS_MATERIAL' },
  { href: '/posts?category=CERTIFICATION', icon: <Award className="h-5 w-5" />, label: '자격증', category: 'CERTIFICATION' },
  // 교직생활
  { href: '#', icon: null, label: '교직생활', isSection: true },
  { href: '/posts?category=SCHOOL_EVENT', icon: <Calendar className="h-5 w-5" />, label: '학교행사', category: 'SCHOOL_EVENT' },
  { href: '/posts?category=PARENT_COUNSEL', icon: <Users className="h-5 w-5" />, label: '학부모상담', category: 'PARENT_COUNSEL' },
  { href: '/posts?category=TEACHER_DAYCARE', icon: <Baby className="h-5 w-5" />, label: '보육교사', category: 'TEACHER_DAYCARE' },
  { href: '/posts?category=TEACHER_SPECIAL', icon: <Heart className="h-5 w-5" />, label: '특수교사', category: 'TEACHER_SPECIAL' },
  { href: '/posts?category=TEACHER_KINDERGARTEN', icon: <School className="h-5 w-5" />, label: '유치원교사', category: 'TEACHER_KINDERGARTEN' },
  // 법률/권익
  { href: '#', icon: null, label: '법률/권익', isSection: true },
  { href: '/posts?category=LEGAL_QNA', icon: <Scale className="h-5 w-5" />, label: '법률 Q&A', category: 'LEGAL_QNA' },
  // 구인
  { href: '#', icon: null, label: '구인', isSection: true },
  { href: '/jobs', icon: <Briefcase className="h-5 w-5" />, label: '구인공고', category: 'JOB_POSTING' },
  // 고객센터
  { href: '#', icon: null, label: '고객센터', isSection: true },
  { href: '/announcements', icon: <Bell className="h-5 w-5" />, label: '공지사항' },
  { href: '/faq', icon: <HelpCircle className="h-5 w-5" />, label: 'FAQ' },
  { href: '/support', icon: <Mail className="h-5 w-5" />, label: '문의하기' },
];

export function SideDrawer() {
  const pathname = usePathname();
  const { isSidebarOpen, setSidebarOpen } = useAppStore();

  // 경로 변경 시 드로어 닫기
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [setSidebarOpen]);

  // 드로어 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  if (!isSidebarOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-[280px] bg-background z-50 lg:hidden',
          'transform transition-transform duration-300 ease-out',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-border">
          <span className="text-lg font-bold text-primary">교사쉼터</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-muted rounded-lg"
            aria-label="메뉴 닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Categories - 스크롤 가능 영역 (헤더 56px 제외) */}
        <nav className="p-4 overflow-y-auto h-[calc(100vh-56px)]">
          <ul className="space-y-1">
            {categories.map((item, index) => {
              if (item.isSection) {
                return (
                  <li key={`section-${index}`} className="pt-4 pb-2 px-3">
                    <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                      {item.label}
                    </span>
                  </li>
                );
              }

              const isActive = item.href === pathname ||
                (item.category && pathname.includes(`category=${item.category}`)) ||
                (item.category === 'JOB_POSTING' && pathname.startsWith('/jobs'));

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-lg transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-foreground hover:bg-muted'
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <hr className="my-4 border-border" />

          {/* Settings */}
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-foreground hover:bg-muted transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span>설정</span>
          </Link>
        </nav>
      </aside>
    </>
  );
}
