'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsAuthenticated, useUser } from '@/stores/auth-store';
import { logout } from '@/lib/auth-api';
import { useRouter } from 'next/navigation';
import { NotificationDropdown } from '@/features/notifications/components/notification-dropdown';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

// 드롭다운 메뉴 설정
const dropdownMenus = {
  community: {
    label: '커뮤니티',
    items: [
      { href: '/posts?category=FREE', label: '자유게시판', category: 'FREE' },
      { href: '/posts?category=ANONYMOUS', label: '익명게시판', category: 'ANONYMOUS' },
      { href: '/posts?category=HUMOR', label: '유머', category: 'HUMOR' },
    ],
  },
  info: {
    label: '정보공유',
    items: [
      { href: '/posts?category=INFO', label: '정보공유', category: 'INFO' },
      { href: '/posts?category=KNOWHOW', label: '노하우', category: 'KNOWHOW' },
      { href: '/posts?category=CLASS_MATERIAL', label: '수업자료', category: 'CLASS_MATERIAL' },
      { href: '/posts?category=CERTIFICATION', label: '자격증', category: 'CERTIFICATION' },
    ],
  },
  teachingLife: {
    label: '교직생활',
    items: [
      { href: '/posts?category=SCHOOL_EVENT', label: '학교행사', category: 'SCHOOL_EVENT' },
      { href: '/posts?category=PARENT_COUNSEL', label: '학부모상담', category: 'PARENT_COUNSEL' },
      { href: '/posts?category=TEACHER_DAYCARE', label: '보육교사', category: 'TEACHER_DAYCARE' },
      { href: '/posts?category=TEACHER_SPECIAL', label: '특수교사', category: 'TEACHER_SPECIAL' },
      { href: '/posts?category=TEACHER_KINDERGARTEN', label: '유치원교사', category: 'TEACHER_KINDERGARTEN' },
    ],
  },
  support: {
    label: '고객센터',
    items: [
      { href: '/announcements', label: '공지사항' },
      { href: '/faq', label: 'FAQ' },
      { href: '/support', label: '문의하기' },
    ],
  },
};

type DropdownKey = keyof typeof dropdownMenus;

// 드롭다운 메뉴 컴포넌트
interface DropdownMenuProps {
  menuKey: DropdownKey;
  label: string;
  items: { href: string; label: string; category?: string }[];
  isActive: boolean;
  currentCategory: string | null;
  pathname: string;
}

function DropdownMenu({ menuKey, label, items, isActive, currentCategory, pathname }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isItemActive = (item: { href: string; category?: string }) => {
    if (item.category) {
      return currentCategory === item.category;
    }
    return pathname === item.href;
  };

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1 px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors relative',
          isActive
            ? 'text-primary'
            : 'text-foreground-muted hover:text-foreground'
        )}
      >
        {label}
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
        {isActive && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 pt-1 z-50">
          <div className="w-40 bg-background border border-border rounded-lg shadow-lg py-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'block px-4 py-2 text-sm transition-colors',
                  isItemActive(item)
                    ? 'text-primary bg-primary/5'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function DesktopHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();
  const currentCategory = searchParams.get('category');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/');
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  // 드롭다운 메뉴가 활성화 상태인지 확인
  const isDropdownActive = useCallback((menuKey: DropdownKey): boolean => {
    const menu = dropdownMenus[menuKey];
    return menu.items.some((item) => {
      if ('category' in item && item.category) {
        return currentCategory === item.category;
      }
      return pathname === item.href;
    });
  }, [currentCategory, pathname]);

  // 단일 링크 활성화 확인
  const isLinkActive = (href: string, category: string | null) => {
    if (category === 'JOB_POSTING') {
      return pathname.startsWith('/jobs') || currentCategory === 'JOB_POSTING';
    }
    if (category) {
      return currentCategory === category;
    }
    return pathname === href && !currentCategory;
  };

  return (
    <header className="hidden lg:block sticky top-0 z-40 bg-background border-b border-border">
      {/* Top bar */}
      <div className="border-b border-border">
        <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-primary">
            🏫 교사쉼터
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <NotificationDropdown />

                {/* User menu */}
                <div className="flex items-center gap-3">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span>{user?.nickname}</span>
                  </Link>
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="p-2 text-foreground-muted hover:text-foreground transition-colors"
                    aria-label="로그아웃"
                  >
                    <LogOut className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  로그인
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="max-w-6xl mx-auto px-8 relative">
        <nav className="flex items-center gap-1 h-12">
          {/* 전체글 */}
          <Link
            href="/"
            className={cn(
              'px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors relative',
              isLinkActive('/', null)
                ? 'text-primary'
                : 'text-foreground-muted hover:text-foreground'
            )}
          >
            전체글
            {isLinkActive('/', null) && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </Link>

          {/* 커뮤니티 드롭다운 */}
          <DropdownMenu
            menuKey="community"
            label={dropdownMenus.community.label}
            items={dropdownMenus.community.items}
            isActive={isDropdownActive('community')}
            currentCategory={currentCategory}
            pathname={pathname}
          />

          {/* 정보공유 드롭다운 */}
          <DropdownMenu
            menuKey="info"
            label={dropdownMenus.info.label}
            items={dropdownMenus.info.items}
            isActive={isDropdownActive('info')}
            currentCategory={currentCategory}
            pathname={pathname}
          />

          {/* 교직생활 드롭다운 */}
          <DropdownMenu
            menuKey="teachingLife"
            label={dropdownMenus.teachingLife.label}
            items={dropdownMenus.teachingLife.items}
            isActive={isDropdownActive('teachingLife')}
            currentCategory={currentCategory}
            pathname={pathname}
          />

          {/* 법률/권익 - 단일 링크 */}
          <Link
            href="/posts?category=LEGAL_QNA"
            className={cn(
              'px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors relative',
              isLinkActive('/posts?category=LEGAL_QNA', 'LEGAL_QNA')
                ? 'text-primary'
                : 'text-foreground-muted hover:text-foreground'
            )}
          >
            법률/권익
            {isLinkActive('/posts?category=LEGAL_QNA', 'LEGAL_QNA') && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </Link>

          {/* 구인공고 - 단일 링크 */}
          <Link
            href="/jobs"
            className={cn(
              'px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors relative',
              isLinkActive('/jobs', 'JOB_POSTING')
                ? 'text-primary'
                : 'text-foreground-muted hover:text-foreground'
            )}
          >
            구인공고
            {isLinkActive('/jobs', 'JOB_POSTING') && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </Link>

          {/* 고객센터 드롭다운 */}
          <DropdownMenu
            menuKey="support"
            label={dropdownMenus.support.label}
            items={dropdownMenus.support.items}
            isActive={isDropdownActive('support')}
            currentCategory={currentCategory}
            pathname={pathname}
          />
        </nav>
      </div>

      {/* 로그아웃 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="로그아웃"
        description="정말 로그아웃 하시겠습니까?"
        confirmLabel="로그아웃"
        cancelLabel="취소"
        isLoading={isLoggingOut}
      />
    </header>
  );
}
