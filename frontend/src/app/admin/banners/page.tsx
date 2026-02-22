'use client';

import { useState, useCallback, useRef } from 'react';
import { Plus, Image as ImageIcon, Eye, EyeOff, Pencil, Trash2, Loader2, ArrowUp, ArrowDown, Upload } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { adminApi, type Banner, type BannerType } from '@/features/admin/services/admin-api';
import { api } from '@/lib/api-client';
import { getImageUrl } from '@/lib/constants';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

const BANNER_TYPE_LABELS: Record<BannerType, string> = {
  PROMO: '프로모션 배너',
  SIDEBAR: '사이드바 광고',
};

export default function BannersAdminPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
  const [filterType, setFilterType] = useState<BannerType | ''>('');
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [type, setType] = useState<BannerType>('PROMO');
  const [priority, setPriority] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: banners, isLoading } = useQuery({
    queryKey: ['admin', 'banners', filterType],
    queryFn: () => adminApi.getBanners(filterType || undefined),
  });

  const createMutation = useMutation({
    mutationFn: adminApi.createBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof adminApi.updateBanner>[1] }) =>
      adminApi.updateBanner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] });
      setDeleteTarget(null);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: adminApi.toggleBannerActive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] });
    },
  });

  const resetForm = useCallback(() => {
    setIsCreating(false);
    setEditingId(null);
    setTitle('');
    setImageUrl('');
    setLinkUrl('');
    setAlt('');
    setType('PROMO');
    setPriority(0);
    setStartDate('');
    setEndDate('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('파일 크기는 10MB를 초과할 수 없습니다');
      return;
    }

    // 이미지 타입 체크
    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드할 수 있습니다');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<{ imageUrl: string }>('/uploads/banner', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setImageUrl(response.data.imageUrl);
      toast.success('이미지가 업로드되었습니다');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('이미지 업로드에 실패했습니다');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = useCallback((banner: Banner) => {
    setEditingId(banner.id);
    setTitle(banner.title);
    setImageUrl(banner.imageUrl);
    setLinkUrl(banner.linkUrl || '');
    setAlt(banner.alt);
    setType(banner.type);
    setPriority(banner.priority);
    setStartDate(banner.startDate ? banner.startDate.split('T')[0] ?? '' : '');
    setEndDate(banner.endDate ? banner.endDate.split('T')[0] ?? '' : '');
    setIsCreating(false);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim() || !imageUrl.trim() || !alt.trim()) return;

      const data = {
        title,
        imageUrl,
        linkUrl: linkUrl || undefined,
        alt,
        type,
        priority,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      if (editingId) {
        updateMutation.mutate({ id: editingId, data });
      } else {
        createMutation.mutate(data);
      }
    },
    [title, imageUrl, linkUrl, alt, type, priority, startDate, endDate, editingId, createMutation, updateMutation]
  );

  const handlePriorityChange = useCallback(
    (banner: Banner, direction: 'up' | 'down') => {
      const newPriority = direction === 'up' ? banner.priority + 1 : banner.priority - 1;
      updateMutation.mutate({
        id: banner.id,
        data: { priority: Math.max(0, newPriority) },
      });
    },
    [updateMutation]
  );

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">배너 관리</h1>
        {!isCreating && !editingId && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            새 배너
          </Button>
        )}
      </div>

      {/* 타입 필터 */}
      <div className="flex gap-2">
        <Button
          variant={filterType === '' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterType('')}
        >
          전체
        </Button>
        {(Object.keys(BANNER_TYPE_LABELS) as BannerType[]).map((t) => (
          <Button
            key={t}
            variant={filterType === t ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType(t)}
          >
            {BANNER_TYPE_LABELS[t]}
          </Button>
        ))}
      </div>

      {/* 작성/수정 폼 */}
      {(isCreating || editingId) && (
        <form onSubmit={handleSubmit} className="bg-card border rounded-lg p-4 space-y-4">
          <h2 className="font-semibold">{editingId ? '배너 수정' : '새 배너 등록'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="배너 제목 (관리용)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <select
              className="h-10 px-3 border rounded-md bg-background"
              value={type}
              onChange={(e) => setType(e.target.value as BannerType)}
            >
              {(Object.keys(BANNER_TYPE_LABELS) as BannerType[]).map((t) => (
                <option key={t} value={t}>
                  {BANNER_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
          {/* 이미지 업로드 */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="이미지 URL (직접 입력 또는 업로드)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required
                className="flex-1"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span className="ml-2 hidden sm:inline">업로드</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              직접 URL을 입력하거나 이미지를 업로드하세요 (최대 10MB)
            </p>
          </div>
          <Input
            placeholder="Alt 텍스트 (접근성)"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            required
          />
          <Input
            placeholder="링크 URL (선택)"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">우선순위</label>
              <Input
                type="number"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                min={0}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">시작일 (선택)</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">종료일 (선택)</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          {imageUrl && (
            <div className="relative w-full h-32 bg-muted rounded-lg overflow-hidden">
              <Image
                src={getImageUrl(imageUrl)}
                alt={alt || '미리보기'}
                fill
                className="object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingId ? '수정' : '등록'}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              취소
            </Button>
          </div>
        </form>
      )}

      {/* 배너 목록 */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : banners && banners.length > 0 ? (
        <div className="space-y-3">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className={`bg-card border rounded-lg p-4 ${!banner.isActive ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start gap-4">
                {/* 이미지 썸네일 */}
                <div className="relative w-24 h-16 bg-muted rounded overflow-hidden shrink-0">
                  <Image
                    src={getImageUrl(banner.imageUrl)}
                    alt={banner.alt}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  {!banner.imageUrl && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* 배너 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium truncate">{banner.title}</h3>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded">
                      {BANNER_TYPE_LABELS[banner.type]}
                    </span>
                    {!banner.isActive && (
                      <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded">
                        비활성
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {banner.linkUrl || '링크 없음'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    우선순위: {banner.priority}
                    {banner.startDate && ` | 시작: ${new Date(banner.startDate).toLocaleDateString()}`}
                    {banner.endDate && ` | 종료: ${new Date(banner.endDate).toLocaleDateString()}`}
                  </p>
                </div>

                {/* 액션 버튼 */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePriorityChange(banner, 'up')}
                    disabled={updateMutation.isPending}
                    title="우선순위 올리기"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePriorityChange(banner, 'down')}
                    disabled={updateMutation.isPending || banner.priority === 0}
                    title="우선순위 내리기"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleActiveMutation.mutate(banner.id)}
                    disabled={toggleActiveMutation.isPending}
                    title={banner.isActive ? '비활성화' : '활성화'}
                  >
                    {banner.isActive ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(banner)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(banner)}
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
          등록된 배너가 없습니다.
        </div>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="배너 삭제"
        description={`"${deleteTarget?.title}" 배너를 삭제하시겠습니까?`}
        confirmLabel="삭제"
        cancelLabel="취소"
        variant="destructive"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
