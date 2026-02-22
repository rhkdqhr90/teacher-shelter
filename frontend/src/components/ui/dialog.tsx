'use client';

import { useEffect, useCallback, useRef, useId, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

// 열린 다이얼로그 수를 추적하여 스크롤 복원 경쟁 조건 방지
let openDialogCount = 0;

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

export function Dialog({
  isOpen,
  onClose,
  children,
  className,
  overlayClassName,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);
  const generatedId = useId();
  const [mounted, setMounted] = useState(false);

  // 클라이언트 사이드에서만 Portal 사용
  useEffect(() => {
    setMounted(true);
  }, []);

  // onClose를 ref로 저장하여 useEffect 의존성에서 제외
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        e.preventDefault();
        onCloseRef.current();
      }
    },
    [closeOnEscape]
  );

  // 포커스 트랩
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !dialogRef.current) return;

    const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement?.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement?.focus();
    }
  }, []);

  // 스크롤 잠금 및 포커스 관리 (isOpen만 의존)
  useEffect(() => {
    if (isOpen) {
      // 첫 번째 다이얼로그가 열릴 때만 스크롤 잠금
      openDialogCount++;
      if (openDialogCount === 1) {
        document.body.style.overflow = 'hidden';
      }

      // 다이얼로그가 방금 열렸을 때만 포커스 설정
      if (!wasOpenRef.current) {
        // 현재 포커스된 요소 저장
        previousActiveElement.current = document.activeElement as HTMLElement;

        // 다이얼로그 내 첫 번째 포커스 가능한 요소에 포커스
        requestAnimationFrame(() => {
          if (dialogRef.current) {
            // 우선순위: input, select, textarea (폼 요소)
            const priorityElement = dialogRef.current.querySelector<HTMLElement>(
              'input:not([type="hidden"]), select, textarea'
            );
            if (priorityElement) {
              priorityElement.focus();
            } else {
              // input이 없으면 일반 focusable 요소 (단, 닫기 버튼 제외)
              const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
                'button:not([aria-label="닫기"]), [href], [tabindex]:not([tabindex="-1"])'
              );
              if (focusableElements.length > 0) {
                focusableElements[0]?.focus();
              } else {
                dialogRef.current.focus();
              }
            }
          }
        });
      }

      wasOpenRef.current = true;
    } else {
      wasOpenRef.current = false;
    }

    return () => {
      if (isOpen) {
        openDialogCount--;
        if (openDialogCount === 0) {
          document.body.style.overflow = '';
        }
        // 이전 포커스 복원
        previousActiveElement.current?.focus();
      }
    };
  }, [isOpen]);

  // 키보드 이벤트 리스너 (별도 useEffect로 분리)
  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleEscape, handleKeyDown]);

  if (!isOpen || !mounted) return null;

  const dialogContent = (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 animate-overlay-show',
          overlayClassName
        )}
        onClick={closeOnOverlayClick ? () => onCloseRef.current() : undefined}
        aria-hidden="true"
      />

      {/* Dialog Content */}
      <div
        ref={dialogRef}
        id={generatedId}
        className={cn(
          'fixed left-1/2 top-1/2 w-full max-w-md',
          'bg-white dark:bg-gray-900 rounded-lg shadow-xl',
          'animate-dialog-content',
          'max-h-[85vh] overflow-auto',
          'outline-none',
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>
  );

  // Portal을 사용하여 body 직접 하위에 렌더링 (sticky header 등과 충돌 방지)
  return createPortal(dialogContent, document.body);
}

interface DialogHeaderProps {
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

export function DialogHeader({ children, onClose, className }: DialogHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700',
        className
      )}
    >
      <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">
        {children}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="닫기"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      )}
    </div>
  );
}

interface DialogBodyProps {
  children: ReactNode;
  className?: string;
}

export function DialogBody({ children, className }: DialogBodyProps) {
  return (
    <div className={cn('p-4', className)}>
      {children}
    </div>
  );
}

interface DialogFooterProps {
  children: ReactNode;
  className?: string;
}

export function DialogFooter({ children, className }: DialogFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700',
        className
      )}
    >
      {children}
    </div>
  );
}
