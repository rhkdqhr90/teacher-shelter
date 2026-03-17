import { api, ApiError, resetRefreshFailCount } from './api-client';
import { useAuthStore, type AuthUser } from '@/stores/auth-store';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  nickname: string;
  jobType?: string;
  career?: number;
  agreedTerms: boolean;
  agreedPrivacy: boolean;
}

interface AuthResponse {
  accessToken: string;
}

interface UserResponse {
  id: string;
  email: string;
  nickname: string;
  role: 'USER' | 'ADMIN';
  jobType?: string;
  career?: number;
  isVerified?: boolean;
  profileImage?: string | null;
  isExpert?: boolean;
  expertType?: 'LAWYER' | 'LEGAL_CONSULTANT' | null;
}

/**
 * JWT 토큰에서 payload 추출 (디코딩)
 */
function decodeToken(token: string): { sub: string; email: string; role: string } | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * 로그인
 */
export async function login(data: LoginRequest): Promise<AuthUser> {
  const response = await api.post<AuthResponse>('/auth/login', data);
  const { accessToken } = response.data;

  // 토큰에서 기본 정보 추출
  const payload = decodeToken(accessToken);
  if (!payload) {
    throw new Error('유효하지 않은 토큰입니다.');
  }

  // 사용자 정보 조회
  const userResponse = await api.get<UserResponse>('/users/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const user: AuthUser = {
    id: userResponse.data.id,
    email: userResponse.data.email,
    nickname: userResponse.data.nickname,
    role: userResponse.data.role,
    jobType: userResponse.data.jobType,
    career: userResponse.data.career,
    isVerified: userResponse.data.isVerified,
    profileImage: userResponse.data.profileImage,
    isExpert: userResponse.data.isExpert,
    expertType: userResponse.data.expertType,
  };

  // 로그인 성공 시 refresh 실패 카운터 리셋
  resetRefreshFailCount();

  // Zustand 스토어에 저장 (메모리)
  useAuthStore.getState().setAuth(accessToken, user);

  return user;
}

/**
 * 회원가입
 */
export async function register(data: RegisterRequest): Promise<AuthUser> {
  const response = await api.post<AuthResponse>('/auth/register', data);
  const { accessToken } = response.data;

  // 토큰에서 기본 정보 추출
  const payload = decodeToken(accessToken);
  if (!payload) {
    throw new Error('유효하지 않은 토큰입니다.');
  }

  // 사용자 정보 조회
  const userResponse = await api.get<UserResponse>('/users/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const user: AuthUser = {
    id: userResponse.data.id,
    email: userResponse.data.email,
    nickname: userResponse.data.nickname,
    role: userResponse.data.role,
    jobType: userResponse.data.jobType,
    career: userResponse.data.career,
    isVerified: userResponse.data.isVerified,
    profileImage: userResponse.data.profileImage,
    isExpert: userResponse.data.isExpert,
    expertType: userResponse.data.expertType,
  };

  // 회원가입 성공 시 refresh 실패 카운터 리셋
  resetRefreshFailCount();

  // Zustand 스토어에 저장 (메모리)
  useAuthStore.getState().setAuth(accessToken, user);

  return user;
}

/**
 * 로그아웃
 */
export async function logout(): Promise<void> {
  try {
    // 서버에 로그아웃 요청 (Cookie의 refreshToken 무효화)
    await api.post('/auth/logout');
  } catch (error) {
    // 서버 에러가 발생해도 클라이언트 상태는 초기화
    // 프로덕션에서는 로깅하지 않음
    if (process.env.NODE_ENV === 'development') {
      console.error('Logout error:', error);
    }
  } finally {
    // Zustand 스토어 초기화
    useAuthStore.getState().clearAuth();
  }
}

/**
 * 비밀번호 찾기 - 이메일로 재설정 링크 발송
 */
export async function forgotPassword(email: string): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>('/auth/forgot-password', { email });
  return response.data;
}

/**
 * 비밀번호 재설정
 */
export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>('/auth/reset-password', {
    token,
    newPassword,
  });
  return response.data;
}

/**
 * 이메일 인증 (6자리 코드)
 */
export async function verifyEmail(code: string): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>('/auth/verify-email', { code });
  // 인증 성공 시 사용자 정보 업데이트
  const currentUser = useAuthStore.getState().user;
  if (currentUser) {
    useAuthStore.getState().updateUser({ isVerified: true });
  }
  return response.data;
}

/**
 * 이메일 인증 재발송
 */
export async function resendVerificationEmail(): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>('/auth/resend-verification');
  return response.data;
}

/**
 * OAuth 임시 코드를 accessToken으로 교환
 */
export async function exchangeOAuthCode(code: string): Promise<string> {
  const response = await api.post<AuthResponse>('/auth/oauth/exchange', { code });
  return response.data.accessToken;
}

/**
 * OAuth 콜백 처리 - 임시 코드로 토큰 교환 후 사용자 정보 조회 및 저장
 */
export async function handleOAuthCallback(code: string): Promise<AuthUser> {
  // 임시 코드를 accessToken으로 교환 (보안: URL에 토큰 노출 방지)
  const accessToken = await exchangeOAuthCode(code);

  // 토큰에서 기본 정보 추출
  const payload = decodeToken(accessToken);
  if (!payload) {
    throw new Error('유효하지 않은 토큰입니다.');
  }

  // 사용자 정보 조회
  const userResponse = await api.get<UserResponse>('/users/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const user: AuthUser = {
    id: userResponse.data.id,
    email: userResponse.data.email,
    nickname: userResponse.data.nickname,
    role: userResponse.data.role,
    jobType: userResponse.data.jobType,
    career: userResponse.data.career,
    isVerified: userResponse.data.isVerified,
    profileImage: userResponse.data.profileImage,
    isExpert: userResponse.data.isExpert,
    expertType: userResponse.data.expertType,
  };

  // OAuth 로그인 성공 시 refresh 실패 카운터 리셋
  resetRefreshFailCount();

  // Zustand 스토어에 저장 (메모리)
  useAuthStore.getState().setAuth(accessToken, user);

  return user;
}

// 중복 호출 방지 플래그
let isInitializing = false;

/**
 * 앱 초기화 시 토큰 갱신 시도
 * - 페이지 새로고침 시 호출
 * - httpOnly Cookie의 refreshToken으로 새 accessToken 발급
 */
export async function initializeAuth(): Promise<boolean> {
  // 이미 초기화 중이면 건너뛰기
  if (isInitializing) {
    return false;
  }

  // 이미 초기화 완료되었으면 건너뛰기
  if (useAuthStore.getState().isInitialized) {
    return true;
  }

  // 이미 accessToken이 있으면 refresh 건너뛰기 (로그인 직후 페이지 이동 시)
  const existingToken = useAuthStore.getState().accessToken;
  if (existingToken) {
    useAuthStore.getState().setInitialized(true);
    return true;
  }

  isInitializing = true;

  try {
    // refreshToken으로 새 accessToken 요청
    const response = await api.post<AuthResponse>('/auth/refresh');
    const { accessToken } = response.data;

    // 사용자 정보 조회
    const userResponse = await api.get<UserResponse>('/users/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const user: AuthUser = {
      id: userResponse.data.id,
      email: userResponse.data.email,
      nickname: userResponse.data.nickname,
      role: userResponse.data.role,
      jobType: userResponse.data.jobType,
      career: userResponse.data.career,
      isVerified: userResponse.data.isVerified,
      profileImage: userResponse.data.profileImage,
      isExpert: userResponse.data.isExpert,
      expertType: userResponse.data.expertType,
    };

    // 앱 초기화 refresh 성공 시 카운터 리셋
    resetRefreshFailCount();

    // 한 번의 상태 업데이트로 처리
    useAuthStore.getState().setAuth(accessToken, user);

    return true;
  } catch (error) {
    // Race condition 보호: refresh 실패했지만 다른 경로(login 등)에서
    // 이미 인증이 완료된 경우 clearAuth하지 않음
    const currentToken = useAuthStore.getState().accessToken;
    if (currentToken) {
      useAuthStore.getState().setInitialized(true);
      return true;
    }

    // 429 (rate limit) 등 일시적 에러는 로그아웃하지 않고 초기화만 완료
    // (새로고침하면 다시 시도할 수 있도록)
    const isTemporaryError =
      error instanceof ApiError && (error.statusCode === 429 || error.statusCode >= 500);

    if (isTemporaryError) {
      // 일시적 에러: 로그아웃하지 않고 미인증 상태로 초기화만 완료
      useAuthStore.getState().setInitialized(true);
    } else {
      // 401/403 등 인증 관련 에러: refreshToken 만료 또는 무효 → 로그아웃
      useAuthStore.getState().clearAuth();
    }
    return false;
  } finally {
    isInitializing = false;
  }
}
