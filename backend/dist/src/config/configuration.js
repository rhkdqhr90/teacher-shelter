"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
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
            origins: process.env.ALLOWED_ORIGINS?.split(',')
                .map((o) => o.trim())
                .filter(Boolean) || ['http://localhost:3000'],
        },
        throttle: {
            ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
            limit: parseInt(process.env.THROTTLE_LIMIT || '300', 10),
        },
        cookie: {
            domain: process.env.COOKIE_DOMAIN || undefined,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        },
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
        allowedRedirectOrigins: process.env.ALLOWED_REDIRECT_ORIGINS?.split(',')
            .map((o) => o.trim())
            .filter(Boolean) || ['http://localhost:3001', 'http://127.0.0.1:3001'],
    };
};
//# sourceMappingURL=configuration.js.map