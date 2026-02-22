'use client';

import { useState } from 'react';
import { Flag } from 'lucide-react';
import { Dialog, DialogHeader, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCreateReport } from '../hooks/use-reports';
import { REPORT_REASONS, REPORT_TYPE_LABELS, type ReportType } from '../types';
import { cn } from '@/lib/utils';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: ReportType;
  targetId: string;
  targetTitle?: string;
}

export function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState('');
  const { mutate: createReport, isPending } = useCreateReport();

  const handleSubmit = () => {
    if (!selectedReason) return;

    const reason = selectedReason === 'other'
      ? customReason
      : REPORT_REASONS.find(r => r.value === selectedReason)?.label || selectedReason;

    const data = {
      type: targetType,
      reason,
      ...(targetType === 'POST' && { targetPostId: targetId }),
      ...(targetType === 'COMMENT' && { targetCommentId: targetId }),
      ...(targetType === 'USER' && { targetUserId: targetId }),
    };

    createReport(data, {
      onSuccess: () => {
        handleClose();
      },
    });
  };

  const handleClose = () => {
    setSelectedReason('');
    setCustomReason('');
    onClose();
  };

  const isSubmitDisabled = !selectedReason || (selectedReason === 'other' && !customReason.trim());

  return (
    <Dialog isOpen={isOpen} onClose={handleClose}>
      <DialogHeader onClose={handleClose}>
        <div className="flex items-center gap-2">
          <Flag className="h-5 w-5 text-red-500" />
          <span>{REPORT_TYPE_LABELS[targetType]} 신고</span>
        </div>
      </DialogHeader>

      <DialogBody>
        {targetTitle && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">신고 대상</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
              {targetTitle}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            신고 사유를 선택해주세요
          </p>

          {REPORT_REASONS.map((reason) => (
            <label
              key={reason.value}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                selectedReason === reason.value
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              )}
            >
              <input
                type="radio"
                name="reason"
                value={reason.value}
                checked={selectedReason === reason.value}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="sr-only"
              />
              <div
                className={cn(
                  'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                  selectedReason === reason.value
                    ? 'border-primary'
                    : 'border-gray-300 dark:border-gray-600'
                )}
              >
                {selectedReason === reason.value && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </div>
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {reason.label}
              </span>
            </label>
          ))}

          {selectedReason === 'other' && (
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="신고 사유를 구체적으로 작성해주세요"
              className="mt-3 w-full min-h-[80px] p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              maxLength={500}
            />
          )}
        </div>

        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          허위 신고는 제재를 받을 수 있습니다. 신중하게 신고해주세요.
        </p>
      </DialogBody>

      <DialogFooter>
        <Button variant="outline" onClick={handleClose} disabled={isPending}>
          취소
        </Button>
        <Button
          variant="destructive"
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          isLoading={isPending}
        >
          신고하기
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
