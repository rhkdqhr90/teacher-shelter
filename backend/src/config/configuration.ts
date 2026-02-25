export default () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    // 환경
    isProduction,
    isDevelopment: process.env.NODE_ENV === 'development',

    port: parseInt(process.env.PORT || '3000', 10),
    database: {
      url: process.env.DATABASE_URL,
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0', 10),
    },
    cors: {
      origins:
        process.env.ALLOWED_ORIGINS?.split(',')
          .map((o) => o.trim())
          .filter(Boolean) || ['http://localhost:3000'],
    },
    throttle: {
      ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
      limit: parseInt(process.env.THROTTLE_LIMIT || '300', 10),
    },

    // 쿠키 설정 (환경별 분기 중앙화)
    cookie: {
      domain: process.env.COOKIE_DOMAIN || undefined, // 프로덕션: '.teacherlounge.co.kr'
      secure: isProduction,
      sameSite: isProduction ? ('none' as const) : ('lax' as const),
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    },

    // 프론트엔드 URL (OAuth 리다이렉트용)
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',

    // 허용된 리다이렉트 Origin (Open Redirect 방지)
    allowedRedirectOrigins:
      process.env.ALLOWED_REDIRECT_ORIGINS?.split(',')
        .map((o) => o.trim())
        .filter(Boolean) || ['http://localhost:3001', 'http://127.0.0.1:3001'],
  };
};
