'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { login as apiLogin, logout as apiLogout, register as apiRegister } from '@/lib/auth-api';
import { useAuthStore, useIsAuthenticated, useUser, useAuthLoading } from '@/stores/auth-store';

export function useAuth() {
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();
  const { isInitialized } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
  };
}

export function useLogin() {
  const router = useRouter();

  const login = useCallback(
    async (email: string, password: string) => {
      await apiLogin({ email, password });
      router.replace('/dashboard');
    },
    [router]
  );

  return { login };
}

export function useRegister() {
  const router = useRouter();

  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      nickname: string;
      jobType?: string;
      career?: number;
      agreedTerms: boolean;
      agreedPrivacy: boolean;
    }) => {
      await apiRegister(data);
      router.replace('/dashboard');
    },
    [router]
  );

  return { register };
}

export function useLogout() {
  const router = useRouter();

  const logout = useCallback(async () => {
    await apiLogout();
    router.replace('/');
  }, [router]);

  return { logout };
}
