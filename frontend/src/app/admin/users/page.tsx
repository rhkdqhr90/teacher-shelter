'use client';

import { useEffect, useState } from 'react';
import { Search, Shield, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/hooks/use-toast';
import { adminApi, type AdminUser } from '@/features/admin/services/admin-api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    variant: 'default' | 'destructive';
    onConfirm: () => void;
  }>({ isOpen: false, title: '', description: '', variant: 'default', onConfirm: () => {} });
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers({
        page,
        limit: 20,
        search: search || undefined,
      });
      setUsers(data.data);
      setMeta({ page: data.meta.page, totalPages: data.meta.totalPages });
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleToggleRole = (user: AdminUser) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    const actionText = newRole === 'ADMIN' ? '관리자로 지정' : '일반 사용자로 변경';

    setConfirmDialog({
      isOpen: true,
      title: '역할 변경',
      description: `${user.nickname}님을 ${actionText}하시겠습니까?`,
      variant: 'default',
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          await adminApi.updateUserRole(user.id, newRole);
          toast.success('역할이 변경되었습니다');
          fetchUsers(meta.page);
        } catch (error) {
          console.error('Failed to update user role:', error);
          toast.error('역할 변경 실패', '역할을 변경할 수 없습니다.');
        } finally {
          setIsProcessing(false);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleDelete = (user: AdminUser) => {
    setConfirmDialog({
      isOpen: true,
      title: '사용자 삭제',
      description: `${user.nickname}님을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
      variant: 'destructive',
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          await adminApi.deleteUser(user.id);
          toast.success('사용자가 삭제되었습니다');
          fetchUsers(meta.page);
        } catch (error) {
          console.error('Failed to delete user:', error);
          toast.error('삭제 실패', '사용자를 삭제할 수 없습니다.');
        } finally {
          setIsProcessing(false);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">사용자 관리</h2>
          <p className="text-muted-foreground">사용자를 검색하고 관리하세요</p>
        </div>
      </div>

      {/* 검색 */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <Input
          placeholder="이메일 또는 닉네임 검색"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Button type="submit" variant="outline">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          사용자가 없습니다
        </div>
      ) : (
        <>
          {/* 데스크탑 테이블 */}
          <div className="hidden lg:block rounded-lg border overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">닉네임</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">이메일</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">역할</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">가입방식</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">게시글</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">신고</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">가입일</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-medium">{user.nickname}</td>
                    <td className="px-4 py-3 text-sm">{user.email}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs ${
                          user.role === 'ADMIN'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {user.role === 'ADMIN' ? '관리자' : '일반'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {user.provider === 'local' ? '이메일' : user.provider}
                    </td>
                    <td className="px-4 py-3 text-sm">{user._count.posts}</td>
                    <td className="px-4 py-3 text-sm">
                      {user._count.reportsReceived > 0 && (
                        <span className="text-red-500">{user._count.reportsReceived}</span>
                      )}
                      {user._count.reportsReceived === 0 && '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleRole(user)}
                          title={user.role === 'ADMIN' ? '관리자 해제' : '관리자 지정'}
                        >
                          <Shield
                            className={`h-4 w-4 ${
                              user.role === 'ADMIN' ? 'text-primary' : 'text-muted-foreground'
                            }`}
                          />
                        </Button>
                        {user.role !== 'ADMIN' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(user)}
                            title="삭제"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 모바일 카드 리스트 */}
          <div className="lg:hidden space-y-3">
            {users.map((user) => (
              <div key={user.id} className="rounded-lg border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm">{user.nickname}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          user.role === 'ADMIN'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {user.role === 'ADMIN' ? '관리자' : '일반'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleRole(user)}
                      title={user.role === 'ADMIN' ? '관리자 해제' : '관리자 지정'}
                    >
                      <Shield
                        className={`h-4 w-4 ${
                          user.role === 'ADMIN' ? 'text-primary' : 'text-muted-foreground'
                        }`}
                      />
                    </Button>
                    {user.role !== 'ADMIN' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(user)}
                        title="삭제"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                  <span>{user.provider === 'local' ? '이메일' : user.provider}</span>
                  <span>게시글 {user._count.posts}</span>
                  {user._count.reportsReceived > 0 && (
                    <span className="text-red-500">신고 {user._count.reportsReceived}</span>
                  )}
                  <span>{new Date(user.createdAt).toLocaleDateString('ko-KR')}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 페이지네이션 */}
      {meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page <= 1}
            onClick={() => fetchUsers(meta.page - 1)}
          >
            이전
          </Button>
          <span className="px-3 py-2 text-sm">
            {meta.page} / {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page >= meta.totalPages}
            onClick={() => fetchUsers(meta.page + 1)}
          >
            다음
          </Button>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        isLoading={isProcessing}
      />
    </div>
  );
}
