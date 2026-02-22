'use client';

import { AlertTriangle, Info, AlertCircle, HelpCircle } from 'lucide-react';
import { Dialog, DialogHeader, DialogBody, DialogFooter } from './dialog';
import { Button } from './button';
import { cn } from '@/lib/utils';

type ConfirmVariant = 'default' | 'destructive' | 'warning' | 'info';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  isLoading?: boolean;
}

const iconMap: Record<ConfirmVariant, React.ReactNode> = {
  default: <HelpCircle className="h-6 w-6 text-primary" />,
  destructive: <AlertCircle className="h-6 w-6 text-red-500" />,
  warning: <AlertTriangle className="h-6 w-6 text-yellow-500" />,
  info: <Info className="h-6 w-6 text-blue-500" />,
};

const bgColorMap: Record<ConfirmVariant, string> = {
  default: 'bg-primary/10',
  destructive: 'bg-red-100 dark:bg-red-900/20',
  warning: 'bg-yellow-100 dark:bg-yellow-900/20',
  info: 'bg-blue-100 dark:bg-blue-900/20',
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  variant = 'default',
  isLoading = false,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="max-w-sm">
      <DialogBody className="pt-6">
        <div className="flex flex-col items-center text-center">
          <div
            className={cn(
              'flex items-center justify-center w-12 h-12 rounded-full mb-4',
              bgColorMap[variant]
            )}
          >
            {iconMap[variant]}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      </DialogBody>
      <DialogFooter className="justify-center border-t-0 pt-0">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          className="min-w-[80px]"
        >
          {cancelLabel}
        </Button>
        <Button
          variant={variant === 'destructive' ? 'destructive' : 'default'}
          onClick={handleConfirm}
          isLoading={isLoading}
          className="min-w-[80px]"
        >
          {confirmLabel}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
