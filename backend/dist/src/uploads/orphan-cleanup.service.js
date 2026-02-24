"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrphanCleanupService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const nest_winston_1 = require("nest-winston");
const prisma_service_1 = require("../database/prisma.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let OrphanCleanupService = class OrphanCleanupService {
    prisma;
    logger;
    uploadDir;
    orphanThresholdMs = 60 * 60 * 1000;
    isRunning = false;
    constructor(prisma, logger) {
        this.prisma = prisma;
        this.logger = logger;
        this.uploadDir = path.join(process.cwd(), 'uploads');
    }
    async handleCron() {
        if (this.isRunning) {
            this.logger.warn('Orphan cleanup already running, skipping...', 'OrphanCleanupService');
            return;
        }
        this.logger.log('Starting orphan file cleanup...', 'OrphanCleanupService');
        await this.cleanupOrphanFiles();
    }
    async cleanupOrphanFiles() {
        if (this.isRunning) {
            return { deleted: 0, errors: 0 };
        }
        this.isRunning = true;
        let deleted = 0;
        let errors = 0;
        try {
            const postResult = await this.cleanupPostImages();
            deleted += postResult.deleted;
            errors += postResult.errors;
            const profileResult = await this.cleanupProfileImages();
            deleted += profileResult.deleted;
            errors += profileResult.errors;
            this.logger.log(`Orphan cleanup completed: ${deleted} files deleted, ${errors} errors`, 'OrphanCleanupService');
        }
        catch (error) {
            this.logger.error(`Orphan cleanup failed: ${error}`, 'OrphanCleanupService');
        }
        finally {
            this.isRunning = false;
        }
        return { deleted, errors };
    }
    async cleanupPostImages() {
        let deleted = 0;
        let errors = 0;
        const postDir = path.join(this.uploadDir, 'post');
        if (!fs.existsSync(postDir)) {
            return { deleted, errors };
        }
        const usedImages = new Set();
        const imageUrlRegex = /\/uploads\/post\/([a-zA-Z0-9_\-.]+)/g;
        const BATCH_SIZE = 500;
        let skip = 0;
        while (true) {
            const posts = await this.prisma.post.findMany({
                select: { content: true },
                skip,
                take: BATCH_SIZE,
            });
            if (posts.length === 0)
                break;
            for (const post of posts) {
                imageUrlRegex.lastIndex = 0;
                let match;
                while ((match = imageUrlRegex.exec(post.content)) !== null) {
                    usedImages.add(match[1]);
                }
            }
            skip += BATCH_SIZE;
            if (posts.length < BATCH_SIZE)
                break;
        }
        const files = await fs.promises.readdir(postDir);
        const now = Date.now();
        for (const filename of files) {
            try {
                const filePath = path.join(postDir, filename);
                const stat = await fs.promises.stat(filePath);
                if (now - stat.mtimeMs < this.orphanThresholdMs) {
                    continue;
                }
                if (!usedImages.has(filename)) {
                    await fs.promises.unlink(filePath);
                    deleted++;
                    this.logger.log(`Deleted orphan post image: ${filename}`, 'OrphanCleanupService');
                }
            }
            catch (error) {
                errors++;
                this.logger.warn(`Failed to process file ${filename}: ${error}`, 'OrphanCleanupService');
            }
        }
        return { deleted, errors };
    }
    async cleanupProfileImages() {
        let deleted = 0;
        let errors = 0;
        const profileDir = path.join(this.uploadDir, 'profile');
        if (!fs.existsSync(profileDir)) {
            return { deleted, errors };
        }
        const users = await this.prisma.user.findMany({
            select: { profileImage: true },
            where: { profileImage: { not: null } },
        });
        const usedImages = new Set();
        for (const user of users) {
            if (user.profileImage) {
                const filename = user.profileImage.replace('/uploads/profile/', '');
                usedImages.add(filename);
            }
        }
        const files = await fs.promises.readdir(profileDir);
        const now = Date.now();
        for (const filename of files) {
            try {
                const filePath = path.join(profileDir, filename);
                const stat = await fs.promises.stat(filePath);
                if (now - stat.mtimeMs < this.orphanThresholdMs) {
                    continue;
                }
                if (!usedImages.has(filename)) {
                    await fs.promises.unlink(filePath);
                    deleted++;
                    this.logger.log(`Deleted orphan profile image: ${filename}`, 'OrphanCleanupService');
                }
            }
            catch (error) {
                errors++;
                this.logger.warn(`Failed to process file ${filename}: ${error}`, 'OrphanCleanupService');
            }
        }
        return { deleted, errors };
    }
};
exports.OrphanCleanupService = OrphanCleanupService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_3AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrphanCleanupService.prototype, "handleCron", null);
exports.OrphanCleanupService = OrphanCleanupService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(nest_winston_1.WINSTON_MODULE_NEST_PROVIDER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], OrphanCleanupService);
//# sourceMappingURL=orphan-cleanup.service.js.map