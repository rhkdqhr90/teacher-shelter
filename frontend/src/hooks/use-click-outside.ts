import { useEffect, type RefObject } from 'react';

/**
 * 요소 외부 클릭 감지 훅
 * @param ref - 감지할 요소의 ref
 * @param handler - 외부 클릭 시 실행할 콜백
 * @param enabled - 활성화 여부 (기본값: true)
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: () => void,
  enabled: boolean = true
): void {
  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, handler, enabled]);
}
