"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsrfMiddleware = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nest_winston_1 = require("nest-winston");
let CsrfMiddleware = class CsrfMiddleware {
    configService;
    logger;
    allowedOrigins;
    constructor(configService, logger) {
        this.configService = configService;
        this.logger = logger;
        const corsOrigins = this.configService.get('cors.origins') || [];
        this.allowedOrigins = Array.isArray(corsOrigins)
            ? corsOrigins
            : [corsOrigins];
    }
    use(req, _res, next) {
        const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
        if (safeMethods.includes(req.method.toUpperCase())) {
            return next();
        }
        const originHeader = req.headers.origin;
        const referer = req.headers.referer;
        const origin = Array.isArray(originHeader)
            ? originHeader[0]
            : originHeader;
        if (origin) {
            if (this.isAllowedOrigin(origin)) {
                return next();
            }
            throw new common_1.ForbiddenException('Invalid origin');
        }
        if (referer) {
            try {
                const refererOrigin = new URL(referer).origin;
                if (this.isAllowedOrigin(refererOrigin)) {
                    return next();
                }
            }
            catch {
            }
            throw new common_1.ForbiddenException('Invalid referer');
        }
        if (process.env.NODE_ENV === 'development') {
            const host = req.headers.host;
            const isLocalhost = host?.startsWith('localhost:') ||
                host?.startsWith('127.0.0.1:') ||
                host === 'localhost' ||
                host === '127.0.0.1';
            if (isLocalhost) {
                return next();
            }
        }
        throw new common_1.ForbiddenException('Missing origin header');
    }
    isAllowedOrigin(origin) {
        return this.allowedOrigins.some((allowed) => {
            if (allowed === '*') {
                if (process.env.NODE_ENV === 'production') {
                    this.logger.warn('Wildcard origin "*" is not allowed in production', 'CsrfMiddleware');
                    return false;
                }
                return true;
            }
            if (allowed === origin)
                return true;
            if (allowed.startsWith('*.')) {
                const domain = allowed.slice(2);
                try {
                    const originHostname = new URL(origin).hostname;
                    return (originHostname.endsWith('.' + domain) || originHostname === domain);
                }
                catch {
                    return false;
                }
            }
            return false;
        });
    }
};
exports.CsrfMiddleware = CsrfMiddleware;
exports.CsrfMiddleware = CsrfMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(nest_winston_1.WINSTON_MODULE_NEST_PROVIDER)),
    __metadata("design:paramtypes", [config_1.ConfigService, Object])
], CsrfMiddleware);
//# sourceMappingURL=csrf.middleware.js.map