'use client';

import { useEffect, useState } from 'react';
import { Users, FileText, MessageSquare, Flag, ShieldCheck } from 'lucide-react';
import { adminApi, type AdminStats } from '@/features/admin/services/admin-api';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminApi.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        toast.error('로딩 실패', '통계를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const statCards = [
    {
      label: '전체 사용자',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      label: '전체 게시글',
      value: stats?.totalPosts || 0,
      icon: FileText,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      label: '전체 댓글',
      value: stats?.totalComments || 0,
      icon: MessageSquare,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      label: '대기 중인 신고',
      value: stats?.pendingReports || 0,
      icon: Flag,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
    {
      label: '대기 중인 인증',
      value: stats?.pendingVerifications || 0,
      icon: ShieldCheck,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">대시보드</h2>
        <p className="text-muted-foreground">서비스 현황을 한눈에 확인하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-lg border bg-card p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{card.label}</span>
                <div className={`p-2 rounded-md ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold">{card.value.toLocaleString()}</p>
            </div>
          );
        })}
      </div>

      {/* 오늘 통계 */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="font-semibold mb-4">오늘 현황</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">신규 가입</p>
              <p className="font-semibold">{stats?.todayUsers || 0}명</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">신규 게시글</p>
              <p className="font-semibold">{stats?.todayPosts || 0}개</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
