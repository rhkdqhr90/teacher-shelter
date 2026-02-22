// HTTP 상태 코드별 기본 메시지
const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: '잘못된 요청입니다.',
  401: '로그인이 필요합니다.',
  403: '접근 권한이 없습니다.',
  404: '요청한 리소스를 찾을 수 없습니다.',
  409: '이미 처리된 요청입니다.',
  422: '입력값을 확인해주세요.',
  429: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  500: '서버 오류가 발생했습니다.',
  502: '서버에 연결할 수 없습니다.',
  503: '서비스가 일시적으로 사용할 수 없습니다.',
  504: '서버 응답 시간이 초과되었습니다.',
};

interface AxiosError {
  response?: {
    status?: number;
    data?: {
      message?: string;
      error?: string;
    };
  };
  code?: string;
  message?: string;
}

/**
 * 네트워크 오류 여부 확인
 */
export function isNetworkError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const axiosError = error as AxiosError;
  return axiosError.code === 'ERR_NETWORK' || axiosError.code === 'ECONNABORTED';
}

/**
 * 타임아웃 오류 여부 확인
 */
export function isTimeoutError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const axiosError = error as AxiosError;
  return axiosError.code === 'ECONNABORTED' || (axiosError.message?.includes('timeout') ?? false);
}

/**
 * HTTP 상태 코드 추출
 */
export function getHttpStatus(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined;

  const axiosError = error as AxiosError;
  return axiosError.response?.status;
}

/**
 * API 에러에서 메시지 추출
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  // 네트워크 오류
  if (isNetworkError(error)) {
    return '네트워크 연결을 확인해주세요.';
  }

  // 타임아웃 오류
  if (isTimeoutError(error)) {
    return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
  }

  const axiosError = error as AxiosError;

  // Axios 에러 형태 - 서버 응답 메시지 우선
  if (axiosError.response?.data?.message) {
    return axiosError.response.data.message;
  }

  // HTTP 상태 코드 기반 메시지
  const status = axiosError.response?.status;
  if (status && HTTP_ERROR_MESSAGES[status]) {
    return HTTP_ERROR_MESSAGES[status];
  }

  // 일반 Error 객체
  if ('message' in error && typeof (error as { message: unknown }).message === 'string') {
    return (error as { message: string }).message;
  }

  return fallback;
}

/**
 * 재시도 가능한 에러인지 확인
 */
export function isRetryableError(error: unknown): boolean {
  if (isNetworkError(error) || isTimeoutError(error)) {
    return true;
  }

  const status = getHttpStatus(error);
  // 5xx 에러 또는 429(Too Many Requests)는 재시도 가능
  return status !== undefined && (status >= 500 || status === 429);
}
