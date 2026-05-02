import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

// ========================================
// 민감 필드 마스킹 (PIPA 컴플라이언스)
// ========================================
// 외부 라이브러리 에러나 객체 로깅 시 password/token/cookie 같은 필드가
// 평문으로 로그파일에 기록되는 것을 방지한다.
// 키 이름은 대소문자 무시 매칭.
const SENSITIVE_KEY_PATTERN =
  /^(password|passwd|pwd|token|accesstoken|refreshtoken|authorization|cookie|secret|apikey|api_key|jwt|sessionid|sessiontoken|otp|verificationcode|emailverificationtoken|passwordresettoken)$/i;
const REDACTED = '[REDACTED]';
const MAX_DEPTH = 6;

function redactSensitive(value: unknown, depth = 0, seen = new WeakSet<object>()): unknown {
  if (depth > MAX_DEPTH) return '[MAX_DEPTH]';
  if (value === null || value === undefined) return value;
  if (typeof value !== 'object') return value;
  if (seen.has(value as object)) return '[Circular]';
  seen.add(value as object);

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitive(item, depth + 1, seen));
  }

  const result: Record<string, unknown> = {};
  for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      result[key] = REDACTED;
    } else {
      result[key] = redactSensitive(v, depth + 1, seen);
    }
  }
  return result;
}

const redactFormat = winston.format((info) => {
  // info 자체를 깊이 순회하며 민감 키 마스킹
  const cleaned = redactSensitive(info) as winston.Logform.TransformableInfo;
  return cleaned;
})();

// 일일 로그 로테이션 설정
const dailyRotateFileTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true, // 오래된 로그 압축
  maxSize: '20m', // 파일당 최대 20MB
  maxFiles: '14d', // 14일간 보관
  format: winston.format.combine(
    redactFormat,
    winston.format.timestamp(),
    winston.format.json(),
  ),
});

const errorRotateFileTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d', // 에러 로그는 30일간 보관
  level: 'error',
  format: winston.format.combine(
    redactFormat,
    winston.format.timestamp(),
    winston.format.json(),
  ),
});

export const winstonConfig = {
  transports: [
    // 콘솔 출력 (개발 환경에서 디버그, 프로덕션에서 info 레벨)
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: winston.format.combine(
        redactFormat,
        winston.format.timestamp(),
        winston.format.ms(),
        nestWinstonModuleUtilities.format.nestLike('NestJS', {
          colors: true,
          prettyPrint: true,
        }),
      ),
    }),
    // 일일 로테이션 로그 파일
    dailyRotateFileTransport,
    // 에러 전용 로테이션 로그 파일
    errorRotateFileTransport,
  ],
};
