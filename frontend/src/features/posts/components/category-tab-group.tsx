'use client';

import { memo, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  PostCategory,
  COMMUNITY_CATEGORIES,
  INFO_CATEGORIES,
  TEACHING_LIFE_CATEGORIES,
} from '../types';
import { CategoryPreviewCard } from './category-preview-card';

const TAB_CONFIG = [
  { id: 'community', label: '커뮤니티', categories: COMMUNITY_CATEGORIES },
  { id: 'info', label: '정보공유', categories: INFO_CATEGORIES },
  { id: 'teaching', label: '교직생활', categories: TEACHING_LIFE_CATEGORIES },
] as const;

type TabId = (typeof TAB_CONFIG)[number]['id'];

export const CategoryTabGroup = memo(function CategoryTabGroup() {
  const [activeTab, setActiveTab] = useState<TabId>('community');

  const handleTabChange = useCallback((tabId: TabId) => {
    setActiveTab(tabId);
  }, []);

  const activeConfig = useMemo(
    () => TAB_CONFIG.find((t) => t.id === activeTab),
    [activeTab]
  );

  const activeCategories = activeConfig?.categories || [];

  return (
    <div className="category-tab-group">
      {/* Tab List */}
      <div role="tablist" className="category-tab-list" aria-label="카테고리 그룹">
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            className={cn(
              'category-tab',
              activeTab === tab.id && 'category-tab--active'
            )}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panel */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="category-tab-panel"
      >
        <div className="dashboard-grid">
          {activeCategories.map((category) => (
            <CategoryPreviewCard key={category} category={category as PostCategory} />
          ))}
        </div>
      </div>
    </div>
  );
});
