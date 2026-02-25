declare const _default: () => {
    isProduction: boolean;
    isDevelopment: boolean;
    port: number;
    database: {
        url: string | undefined;
    };
    redis: {
        host: string;
        port: number;
        password: string | undefined;
        db: number;
    };
    cors: {
        origins: string[];
    };
    throttle: {
        ttl: number;
        limit: number;
    };
    cookie: {
        domain: string | undefined;
        secure: boolean;
        sameSite: "none" | "lax";
        httpOnly: boolean;
        maxAge: number;
    };
    frontendUrl: string;
    allowedRedirectOrigins: string[];
};
export default _default;
