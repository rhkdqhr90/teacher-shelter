import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import type Redis from 'ioredis';
export declare class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly redis;
    private readonly logger;
    constructor(redis: Redis, logger: LoggerService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    isConnected(): boolean;
    set(key: string, value: string, ttlSeconds?: number): Promise<void>;
    get(key: string): Promise<string | null>;
    del(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
    getClient(): Redis;
}
