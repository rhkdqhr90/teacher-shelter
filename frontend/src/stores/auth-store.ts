import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface AuthUser {
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

interface AuthState {
  // State
  accessToken: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  setAuth: (accessToken: string, user: AuthUser) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
  setInitialized: (isInitialized: boolean) => void;
  updateUser: (user: Partial<AuthUser>) => void;

  // Getters
  isAuthenticated: () => boolean;
}

// ========================================
// Multi-tab auth sync via BroadcastChannel
// ========================================
type AuthBroadcastMessage =
  | { type: 'AUTH_LOGIN'; user: AuthUser }
  | { type: 'AUTH_LOGOUT' };

let authChannel: BroadcastChannel | null = null;

function getAuthChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  if (!authChannel) {
    try {
      authChannel = new BroadcastChannel('auth-sync');
    } catch {
      // BroadcastChannel not supported
      return null;
    }
  }
  return authChannel;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      accessToken: null,
      user: null,
      isLoading: false,
      isInitialized: false,

      // Actions
      setAuth: (accessToken: string, user: AuthUser) => {
        set((state) => {
          state.accessToken = accessToken;
          state.user = user;
          state.isLoading = false;
          state.isInitialized = true;
        });
        getAuthChannel()?.postMessage({ type: 'AUTH_LOGIN', user } as AuthBroadcastMessage);
      },

      clearAuth: () => {
        set((state) => {
          state.accessToken = null;
          state.user = null;
          state.isLoading = false;
          state.isInitialized = true;
        });
        getAuthChannel()?.postMessage({ type: 'AUTH_LOGOUT' } as AuthBroadcastMessage);
      },

      setLoading: (isLoading: boolean) =>
        set((state) => {
          state.isLoading = isLoading;
        }),

      setInitialized: (isInitialized: boolean) =>
        set((state) => {
          state.isInitialized = isInitialized;
          state.isLoading = false;
        }),

      updateUser: (userData: Partial<AuthUser>) =>
        set((state) => {
          if (state.user) {
            state.user = { ...state.user, ...userData };
          }
        }),

      // Getters
      isAuthenticated: () => {
        return get().accessToken !== null && get().user !== null;
      },
    })),
    {
      name: 'AuthStore',
      // Disable devtools in production to prevent token exposure in Redux DevTools
      enabled: process.env.NODE_ENV !== 'production',
    },
  ),
);

// Listen for auth changes from other tabs
if (typeof window !== 'undefined') {
  const channel = getAuthChannel();
  if (channel) {
    channel.onmessage = (event: MessageEvent<AuthBroadcastMessage>) => {
      const { data } = event;
      if (data.type === 'AUTH_LOGOUT') {
        // Another tab logged out — clear local state without re-broadcasting
        useAuthStore.setState({
          accessToken: null,
          user: null,
          isLoading: false,
          isInitialized: true,
        });
      } else if (data.type === 'AUTH_LOGIN') {
        // Another tab logged in — reload to trigger token refresh via httpOnly cookie
        window.location.reload();
      }
    };
  }
}

// Selector hooks for better performance
export const useIsAuthenticated = () => useAuthStore((state) => state.accessToken !== null);
export const useUser = () => useAuthStore((state) => state.user);
export const useAccessToken = () => useAuthStore((state) => state.accessToken);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useIsAdmin = () => useAuthStore((state) => state.user?.role === 'ADMIN');
