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
exports.VerificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const uploads_service_1 = require("../uploads/uploads.service");
const notifications_service_1 = require("../notifications/notifications.service");
const client_1 = require("@prisma/client");
let VerificationsService = class VerificationsService {
    prisma;
    uploadsService;
    notificationsService;
    constructor(prisma, uploadsService, notificationsService) {
        this.prisma = prisma;
        this.uploadsService = uploadsService;
        this.notificationsService = notificationsService;
    }
    async create(userId, dto, file) {
        const existing = await this.prisma.verificationRequest.findFirst({
            where: { userId, status: client_1.VerificationStatus.PENDING },
        });
        if (existing) {
            throw new common_1.BadRequestException('이미 대기 중인 인증 요청이 있습니다');
        }
        const fileInfo = await this.uploadsService.saveVerificationFile(file, userId);
        return this.prisma.verificationRequest.create({
            data: {
                userId,
                verificationType: dto.verificationType,
                note: dto.note,
                fileUrl: fileInfo.fileUrl,
                originalFileName: fileInfo.originalFileName,
                fileType: fileInfo.fileType,
                fileSize: fileInfo.fileSize,
                isEncrypted: fileInfo.isEncrypted,
            },
        });
    }
    findMyRequests(userId) {
        return this.prisma.verificationRequest.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getMyLatestStatus(userId) {
        const latestRequest = await this.prisma.verificationRequest.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return {
            hasRequest: !!latestRequest,
            latestStatus: latestRequest?.status || null,
            latestRequest,
        };
    }
    async findAll(page = 1, limit = 20, status) {
        const skip = (page - 1) * limit;
        const where = status ? { status } : {};
        const [data, total] = await Promise.all([
            this.prisma.verificationRequest.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            nickname: true,
                            email: true,
                            jobType: true,
                            career: true,
                            isVerified: true,
                        },
                    },
                    processedBy: {
                        select: { id: true, nickname: true },
                    },
                },
            }),
            this.prisma.verificationRequest.count({ where }),
        ]);
        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const request = await this.prisma.verificationRequest.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        nickname: true,
                        email: true,
                        jobType: true,
                        career: true,
                        isVerified: true,
                    },
                },
                processedBy: {
                    select: { id: true, nickname: true },
                },
            },
        });
        if (!request) {
            throw new common_1.NotFoundException('인증 요청을 찾을 수 없습니다');
        }
        return request;
    }
    async process(id, adminId, dto) {
        const request = await this.findOne(id);
        if (request.status !== client_1.VerificationStatus.PENDING) {
            throw new common_1.BadRequestException('이미 처리된 요청입니다');
        }
        if (dto.status === client_1.VerificationStatus.REJECTED &&
            !dto.rejectionReason?.trim()) {
            throw new common_1.BadRequestException('반려 사유를 입력해주세요');
        }
        if (dto.status === client_1.VerificationStatus.PENDING) {
            throw new common_1.BadRequestException('대기 상태로 변경할 수 없습니다');
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const updated = await tx.verificationRequest.update({
                where: { id },
                data: {
                    status: dto.status,
                    processedById: adminId,
                    processedAt: new Date(),
                    rejectionReason: dto.status === client_1.VerificationStatus.REJECTED
                        ? dto.rejectionReason
                        : null,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            nickname: true,
                            email: true,
                            jobType: true,
                            career: true,
                            isVerified: true,
                        },
                    },
                    processedBy: {
                        select: { id: true, nickname: true },
                    },
                },
            });
            if (dto.status === client_1.VerificationStatus.APPROVED) {
                await tx.user.update({
                    where: { id: request.userId },
                    data: { isVerified: true },
                });
            }
            return updated;
        });
        const notificationType = dto.status === client_1.VerificationStatus.APPROVED
            ? client_1.NotificationType.VERIFICATION_APPROVED
            : client_1.NotificationType.VERIFICATION_REJECTED;
        await this.notificationsService.create({
            type: notificationType,
            userId: request.userId,
            actorId: adminId,
        });
        return result;
    }
    getPendingCount() {
        return this.prisma.verificationRequest.count({
            where: { status: client_1.VerificationStatus.PENDING },
        });
    }
};
exports.VerificationsService = VerificationsService;
exports.VerificationsService = VerificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        uploads_service_1.UploadsService,
        notifications_service_1.NotificationsService])
], VerificationsService);
//# sourceMappingURL=verifications.service.js.map