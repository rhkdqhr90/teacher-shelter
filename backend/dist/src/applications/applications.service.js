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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const dto_1 = require("./dto");
const client_1 = require("@prisma/client");
let ApplicationsService = class ApplicationsService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async create(userId, dto) {
        const post = await this.prisma.post.findUnique({
            where: { id: dto.postId },
            include: { author: true },
        });
        if (!post) {
            throw new common_1.NotFoundException('게시글을 찾을 수 없습니다.');
        }
        if (post.category !== client_1.PostCategory.JOB_POSTING) {
            throw new common_1.BadRequestException('구인공고에만 지원할 수 있습니다.');
        }
        if (!post.isRecruiting) {
            throw new common_1.BadRequestException('마감된 공고입니다.');
        }
        if (post.authorId === userId) {
            throw new common_1.BadRequestException('본인이 작성한 공고에는 지원할 수 없습니다.');
        }
        const existingApplication = await this.prisma.application.findUnique({
            where: {
                postId_applicantId: {
                    postId: dto.postId,
                    applicantId: userId,
                },
            },
        });
        if (existingApplication) {
            throw new common_1.ConflictException('이미 지원한 공고입니다.');
        }
        const application = await this.prisma.application.create({
            data: {
                postId: dto.postId,
                applicantId: userId,
                coverLetter: dto.coverLetter,
                contactPhone: dto.contactPhone,
                contactEmail: dto.contactEmail,
            },
            include: {
                post: true,
                applicant: true,
            },
        });
        if (post.authorId) {
            this.notificationsService.create({
                userId: post.authorId,
                actorId: userId,
                type: client_1.NotificationType.NEW_APPLICATION,
                postId: post.id,
            }).catch(() => {
            });
        }
        return new dto_1.ApplicationResponseDto(application);
    }
    async findMyApplications(userId) {
        const applications = await this.prisma.application.findMany({
            where: { applicantId: userId },
            include: {
                post: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return applications.map((app) => new dto_1.ApplicationResponseDto(app));
    }
    async findByPost(postId, userId) {
        const post = await this.prisma.post.findUnique({
            where: { id: postId },
        });
        if (!post) {
            throw new common_1.NotFoundException('게시글을 찾을 수 없습니다.');
        }
        if (post.authorId !== userId) {
            throw new common_1.ForbiddenException('지원자 목록을 볼 권한이 없습니다.');
        }
        const applications = await this.prisma.application.findMany({
            where: { postId },
            include: {
                applicant: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return applications.map((app) => new dto_1.ApplicationResponseDto(app));
    }
    async findOne(id, userId) {
        const application = await this.prisma.application.findUnique({
            where: { id },
            include: {
                post: {
                    include: { author: true },
                },
                applicant: true,
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('지원 내역을 찾을 수 없습니다.');
        }
        const isApplicant = application.applicantId === userId;
        const isRecruiter = application.post.authorId === userId;
        if (!isApplicant && !isRecruiter) {
            throw new common_1.ForbiddenException('조회 권한이 없습니다.');
        }
        return new dto_1.ApplicationResponseDto(application);
    }
    async updateStatus(id, userId, dto) {
        const application = await this.prisma.application.findUnique({
            where: { id },
            include: {
                post: true,
                applicant: true,
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('지원 내역을 찾을 수 없습니다.');
        }
        if (application.post.authorId !== userId) {
            throw new common_1.ForbiddenException('상태를 변경할 권한이 없습니다.');
        }
        const updated = await this.prisma.application.update({
            where: { id },
            data: {
                status: dto.status,
                recruiterNote: dto.recruiterNote,
            },
            include: {
                post: true,
                applicant: true,
            },
        });
        await this.notificationsService.create({
            userId: application.applicantId,
            actorId: userId,
            type: client_1.NotificationType.APPLICATION_STATUS,
            postId: application.postId,
        });
        return new dto_1.ApplicationResponseDto(updated);
    }
    async cancel(id, userId) {
        const application = await this.prisma.application.findUnique({
            where: { id },
            include: { post: true },
        });
        if (!application) {
            throw new common_1.NotFoundException('지원 내역을 찾을 수 없습니다.');
        }
        if (application.applicantId !== userId) {
            throw new common_1.ForbiddenException('지원을 취소할 권한이 없습니다.');
        }
        if (application.status === client_1.ApplicationStatus.ACCEPTED ||
            application.status === client_1.ApplicationStatus.REJECTED) {
            throw new common_1.BadRequestException('이미 처리된 지원은 취소할 수 없습니다.');
        }
        await this.prisma.application.update({
            where: { id },
            data: { status: client_1.ApplicationStatus.CANCELLED },
        });
    }
    async getApplicationCount(postId) {
        return this.prisma.application.count({
            where: {
                postId,
                status: { not: client_1.ApplicationStatus.CANCELLED },
            },
        });
    }
    async hasApplied(postId, userId) {
        const application = await this.prisma.application.findUnique({
            where: {
                postId_applicantId: {
                    postId,
                    applicantId: userId,
                },
            },
        });
        return !!application;
    }
};
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map