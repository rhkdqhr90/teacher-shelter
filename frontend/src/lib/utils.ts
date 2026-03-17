import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * Merge Tailwind CSS classes with proper conflict resolution
 * @param inputs - Class names to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date to a localized string
 * @param date - Date to format
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, locale: string = 'en-US'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

/**
 * Safely parse JSON with error handling
 * @param json - JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed object or fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Sleep for a given number of milliseconds
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after the given time
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a random string of given length
 * @param length - Length of the string
 * @returns Random string
 */
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 상대적 시간 표시 (예: "3일 전", "방금 전")
 * @param date - Date 객체 또는 날짜 문자열
 * @returns 상대적 시간 문자열
 */
export function formatTimeAgo(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: ko });
}

/**
 * 마크다운 이미지 문법을 안전한 HTML img 태그로 변환
 * XSS 방지: http/https URL만 허용
 */
export function convertMarkdownImages(content: string): string {
  // HTML 블록 태그가 없으면 plain text로 간주하고 줄바꿈을 <br>로 변환
  const hasBlockTags = /<(p|div|br|h[1-6]|ul|ol|li|blockquote|pre|table)\b/i.test(content);
  if (!hasBlockTags) {
    content = content.replace(/\n/g, '<br>\n');
  }

  // 마크다운 이미지 문법: ![alt](url)
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;

  return content.replace(imageRegex, (match, alt, url) => {
    // URL 검증: http/https만 허용 (XSS 방지)
    const trimmedUrl = url.trim();
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      return match; // 안전하지 않은 URL은 변환하지 않음
    }

    // HTML 특수문자 이스케이프
    const safeAlt = alt
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    const safeUrl = trimmedUrl
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    return `<img src="${safeUrl}" alt="${safeAlt}" class="max-w-full h-auto rounded-lg my-4" loading="lazy" />`;
  });
}
