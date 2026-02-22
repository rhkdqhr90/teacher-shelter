'use client';

import { Suspense } from 'react';
import { BottomNav } from './bottom-nav';
import { SideDrawer } from './side-drawer';
import { MobileHeader } from './mobile-header';
import { DesktopHeader } from './desktop-header';
import { DesktopSidebar } from './desktop-sidebar';
import { RightSidebar } from './right-sidebar';
import { Footer } from './footer';
import { SkipLink } from '@/components/common/skip-link';

interface MainLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export function MainLayout({ children, showSidebar = true }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Skip Link for keyboard accessibility */}
      <SkipLink />
      {/* Mobile Header */}
      <MobileHeader />

      {/* Desktop Header */}
      <Suspense fallback={null}>
        <DesktopHeader />
      </Suspense>

      {/* Side Drawer (Mobile) */}
      <SideDrawer />

      {/* Main content area */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 lg:py-6">
        <div className="flex gap-6">
          {/* Desktop Sidebar (Left) */}
          {showSidebar && (
            <Suspense fallback={null}>
              <DesktopSidebar />
            </Suspense>
          )}

          {/* Main content */}
          <main id="main-content" className="flex-1 min-w-0 pb-20 lg:pb-0" tabIndex={-1}>
            {children}
          </main>

          {/* Right Sidebar (Ad) */}
          {showSidebar && (
            <Suspense fallback={null}>
              <RightSidebar />
            </Suspense>
          )}
        </div>
      </div>

      {/* Footer (Desktop) */}
      <Footer />

      {/* Bottom Navigation (Mobile) */}
      <BottomNav />
    </div>
  );
}
