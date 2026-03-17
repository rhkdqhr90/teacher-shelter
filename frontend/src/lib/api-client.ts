import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth-store';
import { API_URL } from './constants';

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Token refresh queue to prevent multiple refresh calls
 */
let isRefreshing = false;
let refreshFailCount = 0;
const MAX_REFRESH_FAILURES = 3;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (error: unknown) => void;
}> = [];

/**
 * Reset refresh fail count (로그인 성공 시 호출)
 */
export function resetRefreshFailCount() {
  refreshFailCount = 0;
}

/**
 * Extended request config with background flag
 */
interface ExtendedRequestConfig extends InternalAxiosRequestConfig {
  _isBackground?: boolean;
  _retry?: boolean;
}

/**
 * Rate limiting retry with exponential backoff
 */
interface RetryConfig {
  _retryCount?: number;
  _retryAfter?: number;
}
const MAX_RATE_LIMIT_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 1000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Create Axios instance with default configuration
 */
const createApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    withCredentials: true, // Cookie 전송을 위해 필수
    headers: {
      'Content-Type': 'application/json',
    },
  });

  /**
   * Request interceptor
   * - Adds authorization token from Zustand store (메모리)
   * - Logs requests in development
   */
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Zustand 스토어에서 accessToken 가져오기 (메모리 저장)
      const accessToken = useAuthStore.getState().accessToken;
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    },
  );

  /**
   * Response interceptor
   * - Handles token refresh on 401
   * - Transforms errors to ApiError
   * - Logs responses in development
   */
  instance.interceptors.response.use(
    (response) => {
      // Log response in development
      if (process.env.NODE_ENV === 'development') {
        // console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
      }
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Handle 429 Too Many Requests - exponential backoff로 재시도
      // 단, 백그라운드 요청(폴링 등)은 재시도 없이 즉시 실패 (다음 폴링 주기에 자연 재시도)
      if (error.response?.status === 429) {
        const extConfig = originalRequest as ExtendedRequestConfig;
        if (extConfig._isBackground) {
          const message = (error.response?.data as { message?: string })?.message || '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
          return Promise.reject(new ApiError(429, message, error.response?.data));
        }

        const config = originalRequest as InternalAxiosRequestConfig & RetryConfig;
        const retryCount = config._retryCount || 0;

        if (retryCount < MAX_RATE_LIMIT_RETRIES) {
          // Retry-After 헤더가 있으면 사용, 없으면 exponential backoff
          const retryAfterHeader = error.response.headers['retry-after'];
          let delay: number;

          if (retryAfterHeader) {
            // Retry-After는 초 단위 또는 HTTP-date 형식
            if (/^\d+$/.test(retryAfterHeader)) {
              delay = parseInt(retryAfterHeader, 10) * 1000;
            } else {
              // HTTP-date 형식 파싱
              const retryDate = new Date(retryAfterHeader);
              delay = Math.max(0, retryDate.getTime() - Date.now());
            }
          } else {
            // Exponential backoff: 1초, 2초, 4초...
            delay = BASE_RETRY_DELAY_MS * Math.pow(2, retryCount);
          }

          // Jitter 추가 (0~20% 랜덤 지연) - 동시 재시도 캐스케이드 방지
          const jitter = Math.random() * delay * 0.2;
          delay = delay + jitter;

          // 최대 10초로 제한
          delay = Math.min(delay, 10000);

          config._retryCount = retryCount + 1;

          await sleep(delay);
          return instance(config);
        }

        // 최대 재시도 횟수 초과
        const message = (error.response?.data as { message?: string })?.message || '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
        const apiError = new ApiError(429, message, error.response?.data);
        return Promise.reject(apiError);
      }

      // Handle 401 Unauthorized - attempt token refresh
      // 단, auth 관련 요청은 제외 (로그인/회원가입/리프레시 실패는 refresh 필요 없음)
      const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
                             originalRequest.url?.includes('/auth/register') ||
                             originalRequest.url?.includes('/auth/refresh');

      const extendedConfig = originalRequest as ExtendedRequestConfig;

      // 백그라운드 요청이면 refresh 시도 없이 조용히 실패
      // (polling 등 백그라운드 요청이 UI 깜빡임을 유발하지 않도록)
      if (error.response?.status === 401 && extendedConfig._isBackground) {
        const apiError = new ApiError(401, '인증 필요 (백그라운드)', error.response?.data);
        return Promise.reject(apiError);
      }

      if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return instance(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Call refresh token endpoint (Cookie의 refreshToken 사용)
          const response = await axios.post<{ accessToken: string }>(
            `${API_URL}/auth/refresh`,
            {},
            { withCredentials: true }
          );
          const { accessToken } = response.data;

          // Refresh 성공 시 실패 카운터 리셋
          refreshFailCount = 0;

          // Zustand 스토어에 새 토큰 저장 (메모리)
          const currentUser = useAuthStore.getState().user;
          if (currentUser) {
            useAuthStore.getState().setAuth(accessToken, currentUser);
          }

          // Update authorization header
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          // Process queued requests
          processQueue(null, accessToken);

          return instance(originalRequest);
        } catch (refreshError) {
          const refreshAxiosError = refreshError as AxiosError;
          const refreshStatus = refreshAxiosError?.response?.status;

          // 409 Conflict = 다른 탭/요청이 이미 refresh 완료 (race condition)
          // 쿠키에 새 토큰이 있을 수 있으므로 한 번 더 시도
          if (refreshStatus === 409 && !originalRequest._retry) {
            originalRequest._retry = true;
            processQueue(null);
            try {
              const retryResponse = await axios.post<{ accessToken: string }>(
                `${API_URL}/auth/refresh`,
                {},
                { withCredentials: true }
              );
              const { accessToken: retryToken } = retryResponse.data;
              refreshFailCount = 0;
              const currentUser = useAuthStore.getState().user;
              if (currentUser) {
                useAuthStore.getState().setAuth(retryToken, currentUser);
              }
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${retryToken}`;
              }
              return instance(originalRequest);
            } catch {
              // 재시도도 실패하면 로그아웃
              useAuthStore.getState().clearAuth();
              return Promise.reject(refreshError);
            }
          }

          // Refresh 실패 카운터 증가
          refreshFailCount++;
          processQueue(refreshError, null);

          // 연속 실패 횟수가 임계값을 넘을 때만 로그아웃
          // (일시적인 네트워크 오류나 백그라운드 요청 실패로 인한 깜빡임 방지)
          if (refreshFailCount >= MAX_REFRESH_FAILURES) {
            useAuthStore.getState().clearAuth();
            refreshFailCount = 0;
          }

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Transform error to ApiError
      const statusCode = error.response?.status || 500;
      const message = (error.response?.data as { message?: string })?.message || error.message || '오류가 발생했습니다.';
      const apiError = new ApiError(statusCode, message, error.response?.data);

      // Log error in development
      if (process.env.NODE_ENV === 'development') {
        console.error(`[API Error] ${originalRequest.method?.toUpperCase()} ${originalRequest.url} - ${statusCode}: ${message}`);
      }

      return Promise.reject(apiError);
    },
  );

  return instance;
};

/**
 * Singleton API client instance
 */
export const api = createApiClient();

/**
 * Type-safe API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode: number;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated response type for list endpoints
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Common pagination params for API requests
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Helper function for type-safe GET requests
 */
export async function apiGet<T>(url: string, config?: Parameters<typeof api.get>[1]): Promise<T> {
  const response = await api.get<ApiResponse<T>>(url, config);
  return response.data.data;
}

/**
 * Helper function for type-safe POST requests
 */
export async function apiPost<T>(url: string, data?: unknown, config?: Parameters<typeof api.post>[2]): Promise<T> {
  const response = await api.post<ApiResponse<T>>(url, data, config);
  return response.data.data;
}

/**
 * Helper function for type-safe PUT requests
 */
export async function apiPut<T>(url: string, data?: unknown, config?: Parameters<typeof api.put>[2]): Promise<T> {
  const response = await api.put<ApiResponse<T>>(url, data, config);
  return response.data.data;
}

/**
 * Helper function for type-safe DELETE requests
 */
export async function apiDelete<T>(url: string, config?: Parameters<typeof api.delete>[1]): Promise<T> {
  const response = await api.delete<ApiResponse<T>>(url, config);
  return response.data.data;
}
