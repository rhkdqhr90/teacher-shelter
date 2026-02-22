'use client';

import { useState, useCallback } from 'react';
import { Plus, Pin, Eye, EyeOff, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { adminApi, type Announcement } from '@/features/admin/services/admin-api';
import { useToast, getErrorMessage } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function AnnouncementsAdminPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isPublished, setIsPublished] = useState(true);

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['admin', 'announcements'],
    queryFn: () => adminApi.getAnnouncements(),
  });

  const createMutation = useMutation({
    mutationFn: adminApi.createAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
      toast.success('공지사항 작성 완료');
      resetForm();
    },
    onError: (error) => {
      toast.error('공지사항 작성 실패', getErrorMessage(error));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof adminApi.updateAnnouncement>[1] }) =>
      adminApi.updateAnnouncement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
      toast.success('공지사항 수정 완료');
      resetForm();
    },
    onError: (error) => {
      toast.error('공지사항 수정 실패', getErrorMessage(error));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
      toast.success('공지사항 삭제 완료');
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast.error('공지사항 삭제 실패', getErrorMessage(error));
    },
  });

  const togglePinMutation = useMutation({
    mutationFn: adminApi.toggleAnnouncementPin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
    },
    onError: (error) => {
      toast.error('상태 변경 실패', getErrorMessage(error));
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: adminApi.toggleAnnouncementPublish,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
    },
    onError: (error) => {
      toast.error('상태 변경 실패', getErrorMessage(error));
    },
  });

  const resetForm = useCallback(() => {
    setIsCreating(false);
    setEditingId(null);
    setTitle('');
    setContent('');
    setIsPinned(false);
    setIsPublished(true);
  }, []);

  const handleEdit = useCallback((announcement: Announcement) => {
    setEditingId(announcement.id);
    setTitle(announcement.title);
    setContent(announcement.content);
    setIsPinned(announcement.isPinned);
    setIsPublished(announcement.isPublished);
    setIsCreating(false);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim() || !content.trim()) return;

      if (editingId) {
        updateMutation.mutate({
          id: editingId,
          data: { title, content, isPinned, isPublished },
        });
      } else {
        createMutation.mutate({ title, content, isPinned, isPublished });
      }
    },
    [title, content, isPinned, isPublished, editingId, createMutation, updateMutation]
  );

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">공지사항 관리</h1>
        {!isCreating && !editingId && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            새 공지사항
          </Button>
        )}
      </div>

      {/* 작성/수정 폼 */}
      {(isCreating || editingId) && (
        <form onSubmit={handleSubmit} className="bg-card border rounded-lg p-4 space-y-4">
          <h2 className="font-semibold">{editingId ? '공지사항 수정' : '새 공지사항 작성'}</h2>
          <Input
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className="w-full min-h-[200px] p-3 border rounded-md bg-background resize-y"
            placeholder="내용을 입력하세요..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">상단 고정</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">공개</span>
            </label>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingId ? '수정' : '작성'}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              취소
            </Button>
          </div>
        </form>
      )}

      {/* 공지사항 목록 */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : announcements && announcements.length > 0 ? (
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="bg-card border rounded-lg p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {announcement.isPinned && (
                      <Pin className="w-4 h-4 text-primary shrink-0" />
                    )}
                    <h3 className="font-medium truncate">{announcement.title}</h3>
                    {!announcement.isPublished && (
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">비공개</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {announcement.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(announcement.createdAt), {
                      addSuffix: true,
                      locale: ko,
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePinMutation.mutate(announcement.id)}
                    disabled={togglePinMutation.isPending}
                    title={announcement.isPinned ? '고정 해제' : '상단 고정'}
                  >
                    <Pin className={`w-4 h-4 ${announcement.isPinned ? 'text-primary' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePublishMutation.mutate(announcement.id)}
                    disabled={togglePublishMutation.isPending}
                    title={announcement.isPublished ? '비공개로 변경' : '공개로 변경'}
                  >
                    {announcement.isPublished ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(announcement)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(announcement)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          공지사항이 없습니다.
        </div>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="공지사항 삭제"
        description={`"${deleteTarget?.title}" 공지사항을 삭제하시겠습니까?`}
        confirmLabel="삭제"
        cancelLabel="취소"
        variant="destructive"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
