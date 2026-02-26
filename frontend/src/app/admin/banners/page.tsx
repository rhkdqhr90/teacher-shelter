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

const BANNER_SIZE_INFO: Record<BannerType, { ratio: string; recommended: string; description: string }> = {
  PROMO: {
    ratio: '16:5 ~ 16:3.5',
    recommended: '1600 x 500px (또는 1600 x 360px)',
    description: '홈 화면 상단 캐러셀. 모바일에서 16:5, 데스크탑에서 16:3.5 비율로 표시됩니다.',
  },
  SIDEBAR: {
    ratio: '1:3',
    recommended: '160 x 480px (또는 320 x 960px)',
    description: '데스크탑 사이드바 세로 배너. 모바일에서는 표시되지 않습니다.',
  },
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
  // 텍스트 배너 전용 상태
  const [bannerMode, setBannerMode] = useState<'image' | 'text'>('image');
  const [bannerText, setBannerText] = useState('');
  const [subText, setSubText] = useState('');
  const [bgColor, setBgColor] = useState('#3B82F6');
  const [textColor, setTextColor] = useState('#FFFFFF');

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
    setBannerMode('image');
    setBannerText('');
    setSubText('');
    setBgColor('#3B82F6');
    setTextColor('#FFFFFF');
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
    setImageUrl(banner.imageUrl || '');
    setLinkUrl(banner.linkUrl || '');
    setAlt(banner.alt);
    setType(banner.type);
    setPriority(banner.priority);
    setStartDate(banner.startDate ? banner.startDate.split('T')[0] ?? '' : '');
    setEndDate(banner.endDate ? banner.endDate.split('T')[0] ?? '' : '');
    // 텍스트 배너 필드
    setBannerMode(banner.bannerText ? 'text' : 'image');
    setBannerText(banner.bannerText || '');
    setSubText(banner.subText || '');
    setBgColor(banner.bgColor || '#3B82F6');
    setTextColor(banner.textColor || '#FFFFFF');
    setIsCreating(false);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim() || !alt.trim()) return;

      // 모드에 따라 필수 값 검증
      if (bannerMode === 'image' && !imageUrl.trim()) return;
      if (bannerMode === 'text' && !bannerText.trim()) return;

      const data = {
        title,
        imageUrl: bannerMode === 'image' ? imageUrl : undefined,
        linkUrl: linkUrl || undefined,
        alt,
        type,
        priority,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        // 텍스트 배너 필드
        bannerText: bannerMode === 'text' ? bannerText : undefined,
        subText: bannerMode === 'text' ? subText || undefined : undefined,
        bgColor: bannerMode === 'text' ? bgColor : undefined,
        textColor: bannerMode === 'text' ? textColor : undefined,
      };

      if (editingId) {
        updateMutation.mutate({ id: editingId, data });
      } else {
        createMutation.mutate(data);
      }
    },
    [title, imageUrl, linkUrl, alt, type, priority, startDate, endDate, editingId, bannerMode, bannerText, subText, bgColor, textColor, createMutation, updateMutation]
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
          {/* 배너 모드 선택 */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={bannerMode === 'image' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setBannerMode('image')}
            >
              🖼️ 이미지 배너
            </Button>
            <Button
              type="button"
              variant={bannerMode === 'text' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setBannerMode('text')}
            >
              📝 텍스트 배너
            </Button>
          </div>

          {/* 권장 사이즈 안내 (이미지 모드일 때만) */}
          {bannerMode === 'image' && (
            <div className="bg-muted/50 border border-border rounded-lg p-3">
              <p className="text-sm font-medium mb-1">
                📐 {BANNER_TYPE_LABELS[type]} 권장 사이즈
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">비율:</span> {BANNER_SIZE_INFO[type].ratio} |
                <span className="font-medium ml-2">권장:</span> {BANNER_SIZE_INFO[type].recommended}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {BANNER_SIZE_INFO[type].description}
              </p>
            </div>
          )}

          {/* 이미지 업로드 (이미지 모드) */}
          {bannerMode === 'image' && (
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
          )}

          {/* 텍스트 배너 설정 (텍스트 모드) */}
          {bannerMode === 'text' && (
            <div className="space-y-4 bg-muted/30 border border-border rounded-lg p-4">
              <div>
                <label className="text-sm font-medium">메인 텍스트 *</label>
                <Input
                  placeholder="배너에 표시할 메인 텍스트"
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value)}
                  maxLength={100}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">부제목 (선택)</label>
                <Input
                  placeholder="추가 설명 텍스트"
                  value={subText}
                  onChange={(e) => setSubText(e.target.value)}
                  maxLength={200}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">배경색</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border"
                    />
                    <Input
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      pattern="^#[0-9A-Fa-f]{6}$"
                      placeholder="#3B82F6"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">글자색</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border"
                    />
                    <Input
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      pattern="^#[0-9A-Fa-f]{6}$"
                      placeholder="#FFFFFF"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              {/* 텍스트 배너 미리보기 */}
              <div>
                <label className="text-sm font-medium">미리보기</label>
                <div
                  className="mt-2 rounded-lg p-6 text-center"
                  style={{ backgroundColor: bgColor, color: textColor }}
                >
                  <p className="text-lg font-bold">{bannerText || '메인 텍스트'}</p>
                  {subText && <p className="text-sm mt-1 opacity-90">{subText}</p>}
                </div>
              </div>
            </div>
          )}
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
          {bannerMode === 'image' && imageUrl && (
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
                {/* 썸네일 (이미지 또는 텍스트 미리보기) */}
                <div className="relative w-24 h-16 bg-muted rounded overflow-hidden shrink-0">
                  {banner.imageUrl ? (
                    <Image
                      src={getImageUrl(banner.imageUrl)}
                      alt={banner.alt}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : banner.bannerText ? (
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center p-1 text-center"
                      style={{ backgroundColor: banner.bgColor || '#3B82F6', color: banner.textColor || '#FFFFFF' }}
                    >
                      <span className="text-[10px] font-bold truncate w-full">{banner.bannerText}</span>
                      {banner.subText && (
                        <span className="text-[8px] opacity-80 truncate w-full">{banner.subText}</span>
                      )}
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* 배너 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium truncate">{banner.title}</h3>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded">
                      {BANNER_TYPE_LABELS[banner.type]}
                    </span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                      {banner.bannerText ? '텍스트' : '이미지'}
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
