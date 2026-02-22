'use client';

import { Component, type ReactNode } from 'react';
import { ErrorState } from './error-state';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 컴포넌트 레벨 Error Boundary
 * 자식 컴포넌트에서 발생한 에러를 잡아 fallback UI를 표시합니다.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 에러 로깅
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
    // 프로덕션에서는 Sentry 등으로 전송
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorState
          title="문제가 발생했어요"
          description={this.state.error?.message || '잠시 후 다시 시도해주세요'}
          onRetry={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}
