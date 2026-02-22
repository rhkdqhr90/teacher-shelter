import type { Metric } from 'web-vitals';
import { logger } from './logger';

const VITALS_DEBUG = process.env.NODE_ENV === 'development';

// 성능 지표 임계값 (ms)
const thresholds = {
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
  FID: { good: 100, needsImprovement: 300 },   // First Input Delay
  CLS: { good: 0.1, needsImprovement: 0.25 },  // Cumulative Layout Shift
  FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint
  TTFB: { good: 800, needsImprovement: 1800 }, // Time to First Byte
  INP: { good: 200, needsImprovement: 500 },   // Interaction to Next Paint
} as const;

type MetricName = keyof typeof thresholds;

function getRating(name: MetricName, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = thresholds[name];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}

export function reportWebVitals(metric: Metric) {
  const { name, value, rating, id, navigationType } = metric;

  // 로컬 로깅 (개발 환경)
  if (VITALS_DEBUG) {
    const customRating = getRating(name as MetricName, value);
    const emoji = customRating === 'good' ? '✅' : customRating === 'needs-improvement' ? '⚠️' : '❌';
    console.log(`${emoji} ${name}: ${Math.round(value)} (${rating})`);
  }

  // 성능 지표 기록
  logger.performance(name, value, {
    id,
    rating,
    navigationType,
  });

  // 프로덕션에서 성능 모니터링 서비스로 전송 (예: Analytics, Sentry 등)
  if (process.env.NODE_ENV === 'production') {
    // TODO: 실제 모니터링 서비스 연동 시 활성화
    // sendToAnalytics({
    //   name,
    //   value,
    //   rating,
    //   id,
    //   navigationType,
    //   url: window.location.href,
    //   timestamp: Date.now(),
    // });
  }
}

// 모든 Web Vitals 측정 시작
export async function initWebVitals() {
  if (typeof window === 'undefined') return;

  try {
    // web-vitals v5에서는 FID가 INP로 대체됨
    const { onCLS, onFCP, onLCP, onTTFB, onINP } = await import('web-vitals');

    onCLS(reportWebVitals);
    onFCP(reportWebVitals);
    onLCP(reportWebVitals);
    onTTFB(reportWebVitals);
    onINP(reportWebVitals);
  } catch (error) {
    // web-vitals 라이브러리 로드 실패 시 무시
    if (VITALS_DEBUG) {
      console.warn('Failed to load web-vitals:', error);
    }
  }
}
