import { NestMiddleware } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response, NextFunction } from 'express';
export declare class CsrfMiddleware implements NestMiddleware {
    private configService;
    private readonly logger;
    private allowedOrigins;
    constructor(configService: ConfigService, logger: LoggerService);
    use(req: Request, _res: Response, next: NextFunction): void;
    private isAllowedOrigin;
}
