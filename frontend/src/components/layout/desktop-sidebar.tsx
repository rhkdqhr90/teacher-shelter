'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { FileText, MessageSquare, Lightbulb, Megaphone, Scale, Flame, ChevronLeft, ChevronRight, ChevronDown, PenSquare, MessageCircle, Heart, Laugh, Briefcase, BookOpen, Award, Calendar, Users, Baby, School, Bell, HelpCircle, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsAuthenticated } from '@/stores/auth-store';
import { useHotPosts } from '@/features/posts/hooks/use-posts';
import { useAppStore } from '@/stores/app-store';
import { AnnouncementWidget, AdWidget } from './sidebar-widgets';

interface CategoryItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  category?: string;
}

interface CategorySection {
  id: string;
  label: string;
  items: CategoryItem[];
}

const categorySections: CategorySection[] = [
  {
    id: 'community',
    label: '커뮤니티',
    items: [
      { href: '/posts?category=FREE', icon: <MessageSquare className="h-3.5 w-3.5" />, label: '자유게시판', category: 'FREE' },
      { href: '/posts?category=ANONYMOUS', icon: <MessageSquare className="h-3.5 w-3.5" />, label: '익명게시판', category: 'ANONYMOUS' },
      { href: '/posts?category=HUMOR', icon: <Laugh className="h-3.5 w-3.5" />, label: '유머', category: 'HUMOR' },
    ],
  },
  {
    id: 'info',
    label: '정보공유',
    items: [
      { href: '/posts?category=INFO', icon: <Megaphone className="h-3.5 w-3.5" />, label: '정보공유', category: 'INFO' },
      { href: '/posts?category=KNOWHOW', icon: <Lightbulb className="h-3.5 w-3.5" />, label: '노하우', category: 'KNOWHOW' },
      { href: '/posts?category=CLASS_MATERIAL', icon: <BookOpen className="h-3.5 w-3.5" />, label: '수업자료', category: 'CLASS_MATERIAL' },
      { href: '/posts?category=CERTIFICATION', icon: <Award className="h-3.5 w-3.5" />, label: '자격증', category: 'CERTIFICATION' },
    ],
  },
  {
    id: 'teaching',
    label: '교직생활',
    items: [
      { href: '/posts?category=SCHOOL_EVENT', icon: <Calendar className="h-3.5 w-3.5" />, label: '학교행사', category: 'SCHOOL_EVENT' },
      { href: '/posts?category=PARENT_COUNSEL', icon: <Users className="h-3.5 w-3.5" />, label: '학부모상담', category: 'PARENT_COUNSEL' },
      { href: '/posts?category=TEACHER_DAYCARE', icon: <Baby className="h-3.5 w-3.5" />, label: '보육교사', category: 'TEACHER_DAYCARE' },
      { href: '/posts?category=TEACHER_SPECIAL', icon: <Heart className="h-3.5 w-3.5" />, label: '특수교사', category: 'TEACHER_SPECIAL' },
      { href: '/posts?category=TEACHER_KINDERGARTEN', icon: <School className="h-3.5 w-3.5" />, label: '유치원교사', category: 'TEACHER_KINDERGARTEN' },
    ],
  },
  {
    id: 'etc',
    label: '기타',
    items: [
      { href: '/posts?category=LEGAL_QNA', icon: <Scale className="h-3.5 w-3.5" />, label: '법률 Q&A', category: 'LEGAL_QNA' },
      { href: '/jobs', icon: <Briefcase className="h-3.5 w-3.5" />, label: '구인공고', category: 'JOB_POSTING' },
    ],
  },
  {
    id: 'support',
    label: '고객센터',
    items: [
      { href: '/announcements', icon: <Bell className="h-3.5 w-3.5" />, label: '공지사항' },
      { href: '/faq', icon: <HelpCircle className="h-3.5 w-3.5" />, label: 'FAQ' },
      { href: '/support', icon: <Mail className="h-3.5 w-3.5" />, label: '문의하기' },
    ],
  },
];

export function DesktopSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAuthenticated = useIsAuthenticated();
  const currentCategory = searchParams.get('category');
  const { data: hotPosts, isLoading: isLoadingHotPosts } = useHotPosts();
  const { isSidebarCollapsed, toggleSidebarCollapse } = useAppStore();

  // 클라이언트 마운트 상태 (hydration 불일치 방지)
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 섹션 접기/펼치기 상태 (기본: 커뮤니티, 정보공유만 열림)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['community', 'info'])
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const isActive = (item: CategoryItem) => {
    if (item.category === 'JOB_POSTING') {
      return pathname.startsWith('/jobs') || currentCategory === 'JOB_POSTING';
    }
    if (item.category) {
      return currentCategory === item.category;
    }
    return pathname === item.href && !currentCategory;
  };

  // 현재 활성화된 카테고리가 속한 섹션 자동 펼치기
  const activeSection = categorySections.find((section) =>
    section.items.some((item) => isActive(item))
  );
  if (activeSection && !expandedSections.has(activeSection.id)) {
    setExpandedSections((prev) => new Set([...prev, activeSection.id]));
  }

  return (
    <aside
      className={cn(
        "hidden lg:block shrink-0 transition-all duration-300",
        isSidebarCollapsed ? "w-[60px]" : "w-[200px]"
      )}
    >
      <div className="sticky top-[112px] space-y-4">
        {/* 토글 버튼 */}
        <div className={cn("flex", isSidebarCollapsed ? "justify-center" : "justify-end px-2")}>
          <button
            onClick={toggleSidebarCollapse}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title={isSidebarCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* 전체글 링크 */}
        {!isSidebarCollapsed && (
          <Link
            href="/"
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors mx-1',
              pathname === '/' && !currentCategory
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-foreground hover:bg-muted'
            )}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>전체글</span>
          </Link>
        )}

        {/* 카테고리 섹션 목록 */}
        <nav className="space-y-1">
          {categorySections.map((section) => {
            const isExpanded = expandedSections.has(section.id);
            const hasActiveItem = section.items.some((item) => isActive(item));

            return (
              <div key={section.id}>
                {/* 섹션 헤더 (접힌 상태에서는 구분선) */}
                {isSidebarCollapsed ? (
                  <hr className="border-border mx-2 my-2" />
                ) : (
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors",
                      hasActiveItem
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <span>{section.label}</span>
                    <ChevronDown
                      className={cn(
                        "h-3 w-3 transition-transform",
                        isExpanded ? "rotate-180" : ""
                      )}
                    />
                  </button>
                )}

                {/* 섹션 아이템 */}
                {(isSidebarCollapsed || isExpanded) && (
                  <ul className={cn("space-y-0.5", !isSidebarCollapsed && "mt-0.5")}>
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            'flex items-center gap-2 py-1 text-[13px] rounded-md transition-colors',
                            isSidebarCollapsed ? 'justify-center px-2' : 'px-3 pl-5',
                            isActive(item)
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                          )}
                          title={isSidebarCollapsed ? item.label : undefined}
                        >
                          {item.icon}
                          {!isSidebarCollapsed && <span>{item.label}</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>

        {/* 실시간 인기글 - 접힌 상태에서는 숨김 */}
        {!isSidebarCollapsed && (
          <div>
            <h3 className="flex items-center gap-1 px-3 mb-2 text-xs font-semibold text-foreground-muted uppercase tracking-wider">
              <Flame className="h-3 w-3 text-accent" />
              실시간 인기글
            </h3>
            {!isMounted || isLoadingHotPosts ? (
              <div className="px-3 py-2">
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-5 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              </div>
            ) : hotPosts && hotPosts.length > 0 ? (
              <ul className="space-y-1">
                {hotPosts.map((post, index) => (
                  <li key={post.id}>
                    <Link
                      href={`/posts/${post.id}`}
                      className="flex items-start gap-2 px-3 py-1.5 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
                    >
                      <span className="text-primary font-medium">{index + 1}.</span>
                      <span className="line-clamp-1">{post.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-3 py-2 text-sm text-foreground-muted">
                아직 인기글이 없습니다
              </p>
            )}
          </div>
        )}

        {/* 접힌 상태에서 인기글 아이콘 */}
        {isSidebarCollapsed && (
          <div className="flex justify-center">
            <Link
              href="/"
              className="p-2 rounded-md text-muted-foreground hover:text-accent hover:bg-muted transition-colors"
              title="실시간 인기글"
            >
              <Flame className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* 공지사항 위젯 - 접힌 상태에서는 숨김 */}
        {!isSidebarCollapsed && <AnnouncementWidget />}

        {/* 광고 위젯 - 접힌 상태에서는 숨김 */}
        {!isSidebarCollapsed && <AdWidget />}

        {/* 로그인 시 내 활동 */}
        {isAuthenticated && (
          <div>
            {!isSidebarCollapsed && (
              <h3 className="px-3 mb-2 text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                내 활동
              </h3>
            )}
            <nav>
              <ul className="space-y-0.5">
                <li>
                  <Link
                    href="/profile/posts"
                    className={cn(
                      "flex items-center gap-2 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors",
                      isSidebarCollapsed ? "justify-center px-2" : "px-3"
                    )}
                    title={isSidebarCollapsed ? "내가 쓴 글" : undefined}
                  >
                    <PenSquare className="h-4 w-4" />
                    {!isSidebarCollapsed && <span>내가 쓴 글</span>}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile/comments"
                    className={cn(
                      "flex items-center gap-2 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors",
                      isSidebarCollapsed ? "justify-center px-2" : "px-3"
                    )}
                    title={isSidebarCollapsed ? "내 댓글" : undefined}
                  >
                    <MessageCircle className="h-4 w-4" />
                    {!isSidebarCollapsed && <span>내 댓글</span>}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile/likes"
                    className={cn(
                      "flex items-center gap-2 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors",
                      isSidebarCollapsed ? "justify-center px-2" : "px-3"
                    )}
                    title={isSidebarCollapsed ? "좋아요 글" : undefined}
                  >
                    <Heart className="h-4 w-4" />
                    {!isSidebarCollapsed && <span>좋아요 글</span>}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </aside>
  );
}
