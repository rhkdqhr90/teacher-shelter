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
exports.InquiriesService = void 0;
const common_1 = require("@nestjs/common");
const nest_winston_1 = require("nest-winston");
const prisma_service_1 = require("../database/prisma.service");
const mail_service_1 = require("../mail/mail.service");
const client_1 = require("@prisma/client");
let InquiriesService = class InquiriesService {
    prisma;
    mailService;
    logger;
    constructor(prisma, mailService, logger) {
        this.prisma = prisma;
        this.mailService = mailService;
        this.logger = logger;
    }
    async create(createInquiryDto) {
        const inquiry = await this.prisma.inquiry.create({
            data: {
                type: createInquiryDto.type,
                email: createInquiryDto.email,
                subject: createInquiryDto.subject,
                content: createInquiryDto.content,
                userId: createInquiryDto.userId,
                status: client_1.InquiryStatus.PENDING,
            },
        });
        try {
            await this.mailService.sendInquiryNotification(inquiry);
        }
        catch (error) {
            this.logger.error('Failed to send inquiry notification email', error, 'InquiriesService');
        }
        this.logger.log(`New inquiry created: ${inquiry.id}`, 'InquiriesService');
        return {
            id: inquiry.id,
            message: '문의가 접수되었습니다. 빠른 시일 내에 답변 드리겠습니다.',
        };
    }
    async findAll(page = 1, limit = 20, status) {
        const skip = (page - 1) * limit;
        const where = status ? { status } : {};
        const [inquiries, total] = await Promise.all([
            this.prisma.inquiry.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.inquiry.count({ where }),
        ]);
        return {
            data: inquiries,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        return this.prisma.inquiry.findUnique({
            where: { id },
        });
    }
    async respond(id, response, respondedById) {
        const inquiry = await this.prisma.inquiry.update({
            where: { id },
            data: {
                response,
                respondedById,
                respondedAt: new Date(),
                status: client_1.InquiryStatus.RESOLVED,
            },
        });
        try {
            await this.mailService.sendInquiryResponse(inquiry);
        }
        catch (error) {
            this.logger.error('Failed to send inquiry response email', error, 'InquiriesService');
        }
        return inquiry;
    }
    async updateStatus(id, status) {
        return this.prisma.inquiry.update({
            where: { id },
            data: { status },
        });
    }
};
exports.InquiriesService = InquiriesService;
exports.InquiriesService = InquiriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(nest_winston_1.WINSTON_MODULE_NEST_PROVIDER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService, Object])
], InquiriesService);
//# sourceMappingURL=inquiries.service.js.map