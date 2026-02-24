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
exports.JobAutoCloseService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const nest_winston_1 = require("nest-winston");
const prisma_service_1 = require("../database/prisma.service");
const client_1 = require("@prisma/client");
let JobAutoCloseService = class JobAutoCloseService {
    prisma;
    logger;
    isRunning = false;
    constructor(prisma, logger) {
        this.prisma = prisma;
        this.logger = logger;
    }
    async handleCron() {
        if (this.isRunning) {
            this.logger.warn('Job auto-close already running, skipping...', 'JobAutoCloseService');
            return;
        }
        this.isRunning = true;
        this.logger.log('Starting job auto-close check...', 'JobAutoCloseService');
        try {
            await this.closeExpiredJobs();
        }
        finally {
            this.isRunning = false;
        }
    }
    async closeExpiredJobs() {
        const now = new Date();
        try {
            const expiredJobs = await this.prisma.post.updateMany({
                where: {
                    category: client_1.PostCategory.JOB_POSTING,
                    isRecruiting: true,
                    isAutoClose: true,
                    deadline: {
                        lt: now,
                    },
                },
                data: {
                    isRecruiting: false,
                },
            });
            if (expiredJobs.count > 0) {
                this.logger.log(`Auto-closed ${expiredJobs.count} expired job postings`, 'JobAutoCloseService');
            }
            return { closed: expiredJobs.count };
        }
        catch (error) {
            this.logger.error(`Job auto-close failed: ${error}`, 'JobAutoCloseService');
            return { closed: 0 };
        }
    }
};
exports.JobAutoCloseService = JobAutoCloseService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobAutoCloseService.prototype, "handleCron", null);
exports.JobAutoCloseService = JobAutoCloseService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(nest_winston_1.WINSTON_MODULE_NEST_PROVIDER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], JobAutoCloseService);
//# sourceMappingURL=job-auto-close.service.js.map