'use client';

import { useState } from 'react';
import { Shield, FileText, Database, Trash2, Download, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/hooks/use-toast';

export default function PrivacyAdminPage() {
  const [isCleanupOpen, setIsCleanupOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const { toast } = useToast();

  const handleCleanup = async () => {
    try {
      // TODO: 실제 API 연동
      toast.success('정리 작업이 시작되었습니다');
      setIsCleanupOpen(false);
    } catch {
      toast.error('정리 실패', '다시 시도해주세요.');
    }
  };

  const handleExport = async () => {
    try {
      // TODO: 실제 API 연동
      toast.success('데이터 내보내기가 시작되었습니다');
      setIsExportOpen(false);
    } catch {
      toast.error('내보내기 실패', '다시 시도해주세요.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">개인정보 관리</h1>
        <p className="text-muted-foreground">개인정보 보호 및 데이터 관리 설정</p>
      </div>

      {/* 안내 카드 */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100">개인정보 처리방침</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              교사쉼터는 개인정보보호법에 따라 이용자의 개인정보를 보호하고 있습니다.
              개인정보 처리방침은 서비스 하단에서 확인할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* 관리 카드들 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* 데이터 보존 정책 */}
        <div className="bg-card border rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">데이터 보존 정책</h3>
              <p className="text-sm text-muted-foreground">개인정보 보존 기간 설정</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">회원 정보</span>
              <span>탈퇴 후 30일</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">게시글/댓글</span>
              <span>영구 보존 (익명화)</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">로그인 기록</span>
              <span>1년</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">인증 파일</span>
              <span>승인/반려 후 90일</span>
            </div>
          </div>
        </div>

        {/* 접근 권한 */}
        <div className="bg-card border rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">접근 권한 관리</h3>
              <p className="text-sm text-muted-foreground">개인정보 접근 권한 현황</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">관리자</span>
              <span className="text-green-600">전체 접근</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">일반 회원</span>
              <span>본인 정보만</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">비회원</span>
              <span className="text-muted-foreground">접근 불가</span>
            </div>
          </div>
        </div>

        {/* 데이터 내보내기 */}
        <div className="bg-card border rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">데이터 내보내기</h3>
              <p className="text-sm text-muted-foreground">전체 데이터 백업</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            관리 목적의 데이터 백업 파일을 생성합니다. 개인정보가 포함되어 있으므로 취급에 주의하세요.
          </p>
          <Button variant="outline" onClick={() => setIsExportOpen(true)}>
            <Download className="w-4 h-4 mr-2" />
            데이터 내보내기
          </Button>
        </div>

        {/* 데이터 정리 */}
        <div className="bg-card border rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold">데이터 정리</h3>
              <p className="text-sm text-muted-foreground">만료된 데이터 삭제</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            보존 기간이 만료된 개인정보 및 고아 파일을 정리합니다. 이 작업은 되돌릴 수 없습니다.
          </p>
          <Button variant="outline" onClick={() => setIsCleanupOpen(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            데이터 정리 실행
          </Button>
        </div>
      </div>

      {/* 감사 로그 */}
      <div className="bg-card border rounded-lg p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">감사 로그</h3>
            <p className="text-sm text-muted-foreground">개인정보 접근 및 처리 기록</p>
          </div>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground text-center">
            감사 로그 기능은 준비 중입니다.
          </p>
        </div>
      </div>

      {/* 주의 사항 */}
      <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-900 dark:text-yellow-100">주의사항</h3>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 space-y-1 list-disc list-inside">
              <li>개인정보 열람 시 접근 로그가 기록됩니다.</li>
              <li>데이터 내보내기 파일은 암호화되어 저장됩니다.</li>
              <li>불필요한 개인정보 접근은 자제해 주세요.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 데이터 정리 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={isCleanupOpen}
        onClose={() => setIsCleanupOpen(false)}
        onConfirm={handleCleanup}
        title="데이터 정리"
        description="보존 기간이 만료된 데이터를 정리합니다. 이 작업은 되돌릴 수 없습니다. 계속하시겠습니까?"
        confirmLabel="정리 실행"
        variant="destructive"
      />

      {/* 데이터 내보내기 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onConfirm={handleExport}
        title="데이터 내보내기"
        description="전체 데이터를 내보냅니다. 개인정보가 포함되어 있으므로 취급에 주의하세요. 계속하시겠습니까?"
        confirmLabel="내보내기"
      />
    </div>
  );
}
