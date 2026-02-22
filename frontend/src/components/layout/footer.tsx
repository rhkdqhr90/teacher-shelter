'use client';

import Link from 'next/link';
import { POST_CATEGORY_LABELS } from '@/features/posts/types';

const BOARD_LINKS = [
  { href: '/posts?category=FREE', label: POST_CATEGORY_LABELS.FREE },
  { href: '/posts?category=ANONYMOUS', label: POST_CATEGORY_LABELS.ANONYMOUS },
  { href: '/posts?category=KNOWHOW', label: POST_CATEGORY_LABELS.KNOWHOW },
  { href: '/posts?category=INFO', label: POST_CATEGORY_LABELS.INFO },
  { href: '/posts?category=LEGAL_QNA', label: POST_CATEGORY_LABELS.LEGAL_QNA },
];

const SUPPORT_LINKS = [
  { href: '/about', label: '서비스 소개' },
  { href: '/announcements', label: '공지사항' },
  { href: '/faq', label: '자주 묻는 질문' },
  { href: '/support', label: '문의하기' },
];

const LEGAL_LINKS = [
  { href: '/terms', label: '이용약관' },
  { href: '/privacy', label: '개인정보처리방침' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="hidden lg:block border-t bg-muted/30 mt-auto">
      <div className="max-w-6xl mx-auto px-8 py-10">
        {/* Grid Layout */}
        <div className="grid grid-cols-4 gap-8">
          {/* 서비스 소개 */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">교사쉼터</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              특수교사, 보육교사를 위한<br />
              익명 고민 공유 + 정보 교류<br />
              커뮤니티입니다.
            </p>
          </div>

          {/* 게시판 */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">게시판</h3>
            <ul className="space-y-2">
              {BOARD_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 고객지원 */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">고객지원</h3>
            <ul className="space-y-2">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 약관 */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">약관</h3>
            <ul className="space-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            &copy; {currentYear} 교사쉼터. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
