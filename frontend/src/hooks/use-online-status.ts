'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * 온라인/오프라인 상태를 감지하는 훅
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // 초기 상태 설정 (SSR 호환)
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * 오프라인 상태 복구 시 콜백 실행
 */
export function useOnReconnect(callback: () => void) {
  const [wasOffline, setWasOffline] = useState(false);

  const handleOffline = useCallback(() => {
    setWasOffline(true);
  }, []);

  const handleOnline = useCallback(() => {
    if (wasOffline) {
      callback();
      setWasOffline(false);
    }
  }, [wasOffline, callback]);

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);
}
