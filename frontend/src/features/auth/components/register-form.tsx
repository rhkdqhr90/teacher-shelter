'use client';

import { Check, X, Loader2, CheckCircle, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { register, verifyEmail, resendVerificationEmail } from '@/lib/auth-api';
import { getErrorMessage } from '@/lib/error';
import { JobType } from '@/features/auth/types/schemas';
import { useAuthStore } from '@/stores/auth-store';

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

const JOB_TYPE_LABELS: Record<JobType, string> = {
  [JobType.SPECIAL_EDUCATION]: '특수교사',
  [JobType.DAYCARE_TEACHER]: '보육교사',
  [JobType.KINDERGARTEN]: '유치원교사',
  [JobType.CARE_TEACHER]: '돌봄교사',
  [JobType.STUDENT]: '학생',
  [JobType.DIRECTOR]: '원장/센터장',
  [JobType.LAWYER]: '법률 자문 변호사',
  [JobType.OTHER]: '기타',
};

type Step = 'register' | 'verify';

export function RegisterForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [step, setStep] = useState<Step>('register');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);

  // 이메일 인증 관련 상태
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 인증 상태 확인
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!isInitialized) return;

    // 이미 로그인 + 이메일 인증 완료 → 대시보드로
    if (accessToken && user?.isVerified) {
      router.replace('/dashboard');
      return;
    }

    // 로그인되어 있지만 이메일 미인증 → 인증 단계로 전환
    if (accessToken && user && !user.isVerified) {
      setRegisteredEmail(user.email);
      setStep('verify');
    }
  }, [isInitialized, accessToken, user, router]);

  const passwordValidation = passwordRules.map((rule) => ({
    ...rule,
    passed: rule.test(password),
  }));
  const allPasswordRulesPassed = passwordValidation.every((rule) => rule.passed);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const allAgreementsChecked = agreedTerms && agreedPrivacy;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const jobType = formData.get('jobType') as string | undefined;
    const careerValue = formData.get('career') as string;
    const career = careerValue ? parseInt(careerValue, 10) : undefined;

    try {
      await register({
        email,
        password,
        nickname: name,
        jobType: jobType || undefined,
        career,
        agreedTerms,
        agreedPrivacy,
      });
      // 회원가입 성공 → 이메일 인증 단계로 이동
      setRegisteredEmail(email);
      setStep('verify');
    } catch (err: unknown) {
      setError(getErrorMessage(err, t('registerError')));
    } finally {
      setIsPending(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(value);
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setVerifyMessage({ type: 'error', text: '6자리 인증 코드를 입력해주세요.' });
      return;
    }

    setIsVerifying(true);
    setVerifyMessage(null);

    try {
      await verifyEmail(verificationCode);
      setVerifyMessage({ type: 'success', text: '이메일 인증이 완료되었습니다!' });
      // 인증 성공 후 대시보드로 이동
      setTimeout(() => {
        router.replace('/dashboard');
      }, 1000);
    } catch (err: unknown) {
      setVerifyMessage({ type: 'error', text: getErrorMessage(err, '인증에 실패했습니다. 코드를 확인해주세요.') });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setVerifyMessage(null);

    try {
      await resendVerificationEmail();
      setVerifyMessage({ type: 'success', text: '인증 코드가 재발송되었습니다.' });
      setVerificationCode('');
    } catch (err: unknown) {
      setVerifyMessage({ type: 'error', text: getErrorMessage(err, '재발송에 실패했습니다.') });
    } finally {
      setIsResending(false);
    }
  };

  // 이메일 인증 단계
  if (step === 'verify') {
    return (
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">이메일 인증</h1>
          <p className="text-muted-foreground text-sm">
            <span className="font-medium text-foreground">{registeredEmail}</span>
            <br />
            위 이메일로 발송된 6자리 인증 코드를 입력해주세요.
          </p>
        </div>

        <div className="space-y-4">
          {verifyMessage && (
            <div
              className={`rounded-md p-3 text-sm ${
                verifyMessage.type === 'success'
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-destructive/10 text-destructive'
              }`}
            >
              {verifyMessage.text}
            </div>
          )}

          <div>
            <label htmlFor="verificationCode" className="mb-2 block text-sm font-medium">
              인증 코드
            </label>
            <Input
              id="verificationCode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              value={verificationCode}
              onChange={handleCodeChange}
              className="text-center text-2xl tracking-widest font-mono"
              disabled={isVerifying}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              인증 코드는 10분간 유효합니다.
            </p>
          </div>

          <Button
            type="button"
            className="w-full"
            onClick={handleVerify}
            disabled={isVerifying || verificationCode.length !== 6}
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                확인 중...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                인증 완료
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleResend}
            disabled={isResending}
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                발송 중...
              </>
            ) : (
              '코드 재발송'
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            이메일 인증을 완료해야 서비스를 이용할 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  // 회원가입 폼
  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">{t('register')}</h1>
        <p className="text-muted-foreground">{t('registerSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            {t('name')}
          </label>
          <Input id="name" name="name" type="text" placeholder="이름을 입력하세요" required />
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            {t('email')}
          </label>
          <Input id="email" name="email" type="email" placeholder="이메일을 입력하세요" required />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium">
            {t('password')}
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {/* 비밀번호 유효성 검사 실시간 피드백 */}
          {password.length > 0 && (
            <div className="mt-2 space-y-1">
              {passwordValidation.map((rule) => (
                <div
                  key={rule.key}
                  className={`flex items-center gap-2 text-xs ${
                    rule.passed ? 'text-green-600' : 'text-muted-foreground'
                  }`}
                >
                  {rule.passed ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <X className="w-3 h-3 text-red-500" />
                  )}
                  {rule.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium">
            {t('confirmPassword')}
          </label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {/* 비밀번호 일치 여부 피드백 */}
          {confirmPassword.length > 0 && (
            <div
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
            </div>
          )}
        </div>

        <div>
          <label htmlFor="jobType" className="mb-2 block text-sm font-medium">
            직종 (선택)
          </label>
          <select
            id="jobType"
            name="jobType"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">선택 안함</option>
            {Object.entries(JOB_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="career" className="mb-2 block text-sm font-medium">
            경력 (년, 선택)
          </label>
          <Input
            id="career"
            name="career"
            type="number"
            min="0"
            max="50"
            placeholder="예: 5"
          />
        </div>

        {/* 약관 동의 */}
        <div className="space-y-3 rounded-lg border border-input p-4">
          <p className="text-sm font-medium">약관 동의</p>

          <div className="flex items-start gap-2">
            <Checkbox
              id="terms"
              checked={agreedTerms}
              onCheckedChange={(checked) => setAgreedTerms(checked === true)}
            />
            <label htmlFor="terms" className="text-sm leading-tight cursor-pointer">
              <span className="text-destructive">*</span>{' '}
              <Link href="/terms" target="_blank" className="text-primary hover:underline">
                이용약관
              </Link>
              에 동의합니다
            </label>
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="privacy"
              checked={agreedPrivacy}
              onCheckedChange={(checked) => setAgreedPrivacy(checked === true)}
            />
            <label htmlFor="privacy" className="text-sm leading-tight cursor-pointer">
              <span className="text-destructive">*</span>{' '}
              <Link href="/privacy" target="_blank" className="text-primary hover:underline">
                개인정보처리방침
              </Link>
              에 동의합니다
            </label>
          </div>

          <p className="text-xs text-muted-foreground">
            * 필수 동의 항목입니다
          </p>
        </div>

        <Button
          type="submit"
          className="w-full"
          isLoading={isPending}
          disabled={isPending || !allPasswordRulesPassed || !passwordsMatch || !allAgreementsChecked}
        >
          {isPending ? t('registering') : t('register')}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t('hasAccount')}{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          {t('login')}
        </Link>
      </p>
    </div>
  );
}
