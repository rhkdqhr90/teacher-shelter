'use client';

import { useCallback, useEffect, useRef } from 'react';

interface UseKeyboardNavigationOptions {
  selector: string;
  onSelect?: (element: HTMLElement, index: number) => void;
  loop?: boolean;
  orientation?: 'horizontal' | 'vertical' | 'both';
}

export function useKeyboardNavigation<T extends HTMLElement>({
  selector,
  onSelect,
  loop = true,
  orientation = 'vertical',
}: UseKeyboardNavigationOptions) {
  const containerRef = useRef<T>(null);
  const currentIndexRef = useRef(-1);

  const getItems = useCallback(() => {
    if (!containerRef.current) return [];
    return Array.from(containerRef.current.querySelectorAll<HTMLElement>(selector));
  }, [selector]);

  const focusItem = useCallback((index: number) => {
    const items = getItems();
    if (items.length === 0) return;

    let newIndex = index;
    if (loop) {
      newIndex = ((index % items.length) + items.length) % items.length;
    } else {
      newIndex = Math.max(0, Math.min(index, items.length - 1));
    }

    const item = items[newIndex];
    if (item) {
      item.focus();
      currentIndexRef.current = newIndex;
    }
  }, [getItems, loop]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const items = getItems();
    if (items.length === 0) return;

    const activeElement = document.activeElement;
    const currentIndex = items.findIndex(item => item === activeElement || item.contains(activeElement as Node));

    if (currentIndex === -1) return;

    let handled = false;

    switch (event.key) {
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'both') {
          focusItem(currentIndex + 1);
          handled = true;
        }
        break;
      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'both') {
          focusItem(currentIndex - 1);
          handled = true;
        }
        break;
      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          focusItem(currentIndex + 1);
          handled = true;
        }
        break;
      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          focusItem(currentIndex - 1);
          handled = true;
        }
        break;
      case 'Home':
        focusItem(0);
        handled = true;
        break;
      case 'End':
        focusItem(items.length - 1);
        handled = true;
        break;
      case 'Enter':
      case ' ':
        if (onSelect && activeElement instanceof HTMLElement) {
          onSelect(activeElement, currentIndex);
          handled = true;
        }
        break;
    }

    if (handled) {
      event.preventDefault();
    }
  }, [getItems, focusItem, onSelect, orientation]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { containerRef, focusItem, getItems };
}
