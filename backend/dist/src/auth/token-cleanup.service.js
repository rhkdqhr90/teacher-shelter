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
var TokenCleanupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenCleanupService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let TokenCleanupService = TokenCleanupService_1 = class TokenCleanupService {
    prisma;
    logger = new common_1.Logger(TokenCleanupService_1.name);
    CLEANUP_INTERVAL_MS = 60 * 60 * 1000;
    cleanupTimer = null;
    constructor(prisma) {
        this.prisma = prisma;
    }
    onModuleInit() {
        this.cleanupExpiredTokens();
        this.cleanupTimer = setInterval(() => {
            this.cleanupExpiredTokens();
        }, this.CLEANUP_INTERVAL_MS);
        this.logger.log('Token cleanup service initialized (runs every 1 hour)');
    }
    onModuleDestroy() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
            this.logger.log('Token cleanup service stopped');
        }
    }
    async cleanupExpiredTokens() {
        try {
            const refreshResult = await this.prisma.refreshToken.deleteMany({
                where: {
                    OR: [
                        { expiresAt: { lt: new Date() } },
                        { revokedAt: { not: null } },
                    ],
                },
            });
            const blacklistResult = await this.prisma.tokenBlacklist.deleteMany({
                where: {
                    expiresAt: { lt: new Date() },
                },
            });
            if (refreshResult.count > 0 || blacklistResult.count > 0) {
                this.logger.log(`Cleaned up ${refreshResult.count} expired/revoked refresh tokens, ${blacklistResult.count} expired blacklist entries`);
            }
        }
        catch (error) {
            this.logger.error('Failed to cleanup expired tokens', error);
        }
    }
};
exports.TokenCleanupService = TokenCleanupService;
exports.TokenCleanupService = TokenCleanupService = TokenCleanupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TokenCleanupService);
//# sourceMappingURL=token-cleanup.service.js.map