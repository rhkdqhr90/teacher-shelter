/**
 * 프론트엔드 로깅 유틸리티
 * 프로덕션 환경에서 에러 추적 및 분석을 위한 로거
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  [key: string]: unknown;
}

interface ErrorContext extends LogContext {
  stack?: string;
  url?: string;
  userAgent?: string;
}

const isDev = process.env.NODE_ENV === 'development';

/**
 * 로그 레벨별 색상 (개발 환경 콘솔용)
 */
const logColors: Record<LogLevel, string> = {
  debug: '#9CA3AF',
  info: '#3B82F6',
  warn: '#F59E0B',
  error: '#EF4444',
};

/**
 * 기본 로거 함수
 */
function log(level: LogLevel, message: string, context?: LogContext) {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    level,
    message,
    ...context,
  };

  // 개발 환경: 콘솔에 출력
  if (isDev) {
    const color = logColors[level];
    console.log(
      `%c[${level.toUpperCase()}] ${timestamp}`,
      `color: ${color}; font-weight: bold`,
      message,
      context || ''
    );
    return;
  }

  // 프로덕션 환경: 에러만 추적 서비스로 전송
  if (level === 'error') {
    sendToErrorTracker(logData);
  }
}

/**
 * 에러 추적 서비스로 전송 (Sentry, LogRocket 등 연동 시 사용)
 */
function sendToErrorTracker(data: Record<string, unknown>) {
  // TODO: Sentry 또는 다른 에러 추적 서비스 연동
  // Sentry.captureMessage(data.message, { extra: data });

  // 현재는 콘솔에만 출력 (프로덕션에서도)
  if (typeof window !== 'undefined') {
    console.error('[Error Tracker]', data);
  }
}

/**
 * 에러 객체를 로그용 컨텍스트로 변환
 */
function errorToContext(error: unknown): ErrorContext {
  if (error instanceof Error) {
    return {
      stack: error.stack,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };
  }
  return {
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  };
}

/**
 * 로거 인스턴스
 */
export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, error?: unknown, context?: LogContext) => {
    const errorContext = error ? errorToContext(error) : {};
    log('error', message, { ...errorContext, ...context });
  },

  /**
   * API 에러 로깅
   */
  apiError: (endpoint: string, status: number, error?: unknown) => {
    logger.error(`API Error: ${endpoint}`, error, {
      action: 'api_call',
      endpoint,
      status,
    });
  },

  /**
   * 사용자 행동 로깅 (분석용)
   */
  action: (action: string, context?: LogContext) => {
    log('info', `User Action: ${action}`, { action, ...context });
  },

  /**
   * 성능 메트릭 로깅
   */
  performance: (metric: string, value: number, context?: LogContext) => {
    log('info', `Performance: ${metric}`, { metric, value, ...context });
  },
};

/**
 * React Error Boundary용 에러 핸들러
 */
export function handleBoundaryError(error: Error, errorInfo: React.ErrorInfo) {
  logger.error('React Error Boundary caught error', error, {
    component: 'ErrorBoundary',
    componentStack: errorInfo.componentStack || undefined,
  });
}

/**
 * 전역 에러 핸들러 설정
 */
export function setupGlobalErrorHandlers() {
  if (typeof window === 'undefined') return;

  // 처리되지 않은 에러
  window.addEventListener('error', (event) => {
    logger.error('Uncaught Error', event.error, {
      action: 'uncaught_error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  // 처리되지 않은 Promise rejection
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled Promise Rejection', event.reason, {
      action: 'unhandled_rejection',
    });
  });
}
