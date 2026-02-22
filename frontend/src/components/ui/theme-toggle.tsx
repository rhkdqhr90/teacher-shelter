'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className={cn('p-2 rounded-md', className)} disabled>
        <Sun className="h-5 w-5 text-foreground-muted" />
      </button>
    );
  }

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="h-5 w-5" />;
    }
    return resolvedTheme === 'dark' ? (
      <Moon className="h-5 w-5" />
    ) : (
      <Sun className="h-5 w-5" />
    );
  };

  const getLabel = () => {
    if (theme === 'system') return '시스템';
    return theme === 'dark' ? '다크' : '라이트';
  };

  return (
    <button
      onClick={cycleTheme}
      className={cn(
        'p-2 rounded-md text-foreground-muted hover:text-foreground hover:bg-muted transition-colors',
        className
      )}
      aria-label={`현재 테마: ${getLabel()}. 클릭하여 변경`}
      title={`${getLabel()} 모드`}
    >
      <span className="flex items-center gap-2">
        {getIcon()}
        {showLabel && <span className="text-sm">{getLabel()}</span>}
      </span>
    </button>
  );
}
