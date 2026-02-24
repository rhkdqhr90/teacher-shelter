declare const _default: () => {
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
};
export default _default;
