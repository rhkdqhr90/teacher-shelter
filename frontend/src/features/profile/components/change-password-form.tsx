'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useChangePassword } from '../hooks/use-profile';
import { changePasswordSchema } from '../types';

// 일반적인 취약 비밀번호 목록
const COMMON_PASSWORDS = [
  'password', '12345678', '123456789', 'qwerty123', 'password1',
  'iloveyou', 'admin123', 'welcome1', 'monkey123', 'dragon12',
  'master12', 'letmein1', 'sunshine', 'princess', 'football',
];

// 비밀번호 유효성 검사 규칙
const passwordRules = [
  { key: 'minLength', test: (pw: string) => pw.length >= 8, label: '8자 이상' },
  { key: 'hasLetter', test: (pw: string) => /[a-zA-Z]/.test(pw), label: '영문 포함' },
  { key: 'hasNumber', test: (pw: string) => /[0-9]/.test(pw), label: '숫자 포함' },
  { key: 'hasSpecial', test: (pw: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pw), label: '특수문자 포함' },
  { key: 'notCommon', test: (pw: string) => !COMMON_PASSWORDS.includes(pw.toLowerCase()), label: '일반적인 비밀번호 아님' },
];

export function ChangePasswordForm() {
  const router = useRouter();
  const changePassword = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // 비밀번호 유효성 검사
  const passwordValidation = passwordRules.map((rule) => ({
    ...rule,
    passed: rule.test(newPassword),
  }));
  const allPasswordRulesPassed = passwordValidation.every((rule) => rule.passed);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const result = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!result.success) {
      setError(result.error.errors[0]?.message || '입력을 확인해주세요.');
      return;
    }

    try {
      await changePassword.mutateAsync({
        currentPassword,
        newPassword,
      });
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } catch {
      setError('비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 text-green-600 rounded-md text-sm">
          비밀번호가 변경되었습니다.
        </div>
      )}

      {/* Current Password */}
      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium mb-2">
          현재 비밀번호
        </label>
        <Input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="현재 비밀번호를 입력하세요"
        />
      </div>

      {/* New Password */}
      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
          새 비밀번호
        </label>
        <Input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="새 비밀번호를 입력하세요"
        />
        {/* 비밀번호 규칙 체크리스트 */}
        {newPassword.length > 0 && (
          <ul className="mt-2 space-y-1">
            {passwordValidation.map((rule) => (
              <li
                key={rule.key}
                className={`flex items-center gap-2 text-xs ${
                  rule.passed ? 'text-green-600' : 'text-muted-foreground'
                }`}
              >
                {rule.passed ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <X className="w-3 h-3" />
                )}
                {rule.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
          비밀번호 확인
        </label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="새 비밀번호를 다시 입력하세요"
        />
        {/* 비밀번호 일치 여부 */}
        {confirmPassword.length > 0 && (
          <p
            className={`mt-2 flex items-center gap-2 text-xs ${
              passwordsMatch ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {passwordsMatch ? (
              <>
                <Check className="w-3 h-3" />
                비밀번호가 일치합니다
              </>
            ) : (
              <>
                <X className="w-3 h-3" />
                비밀번호가 일치하지 않습니다
              </>
            )}
          </p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="flex-1"
        >
          취소
        </Button>
        <Button
          type="submit"
          disabled={changePassword.isPending || !allPasswordRulesPassed || !passwordsMatch || !currentPassword}
          className="flex-1"
        >
          {changePassword.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              변경 중...
            </>
          ) : (
            '비밀번호 변경'
          )}
        </Button>
      </div>
    </form>
  );
}
