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
exports.BannersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const client_1 = require("@prisma/client");
let BannersService = class BannersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        if (!dto.imageUrl && !dto.bannerText) {
            throw new common_1.BadRequestException('이미지 URL 또는 배너 텍스트 중 하나는 필수입니다.');
        }
        return this.prisma.banner.create({
            data: {
                title: dto.title,
                imageUrl: dto.imageUrl,
                linkUrl: dto.linkUrl,
                alt: dto.alt,
                type: dto.type || client_1.BannerType.PROMO,
                bannerText: dto.bannerText,
                subText: dto.subText,
                bgColor: dto.bgColor,
                textColor: dto.textColor,
                isActive: dto.isActive ?? true,
                priority: dto.priority ?? 0,
                startDate: dto.startDate ? new Date(dto.startDate) : null,
                endDate: dto.endDate ? new Date(dto.endDate) : null,
            },
        });
    }
    async findAll(type) {
        return this.prisma.banner.findMany({
            where: type ? { type } : undefined,
            orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        });
    }
    async findActive(type) {
        const now = new Date();
        return this.prisma.banner.findMany({
            where: {
                type,
                isActive: true,
                OR: [
                    { startDate: null, endDate: null },
                    { startDate: { lte: now }, endDate: null },
                    { startDate: null, endDate: { gte: now } },
                    { startDate: { lte: now }, endDate: { gte: now } },
                ],
            },
            orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        });
    }
    async findOne(id) {
        const banner = await this.prisma.banner.findUnique({
            where: { id },
        });
        if (!banner) {
            throw new common_1.NotFoundException('배너를 찾을 수 없습니다.');
        }
        return banner;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.banner.update({
            where: { id },
            data: {
                ...(dto.title !== undefined && { title: dto.title }),
                ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
                ...(dto.linkUrl !== undefined && { linkUrl: dto.linkUrl }),
                ...(dto.alt !== undefined && { alt: dto.alt }),
                ...(dto.type !== undefined && { type: dto.type }),
                ...(dto.bannerText !== undefined && { bannerText: dto.bannerText }),
                ...(dto.subText !== undefined && { subText: dto.subText }),
                ...(dto.bgColor !== undefined && { bgColor: dto.bgColor }),
                ...(dto.textColor !== undefined && { textColor: dto.textColor }),
                ...(dto.isActive !== undefined && { isActive: dto.isActive }),
                ...(dto.priority !== undefined && { priority: dto.priority }),
                ...(dto.startDate !== undefined && {
                    startDate: dto.startDate ? new Date(dto.startDate) : null,
                }),
                ...(dto.endDate !== undefined && {
                    endDate: dto.endDate ? new Date(dto.endDate) : null,
                }),
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.banner.delete({ where: { id } });
    }
    async toggleActive(id) {
        const banner = await this.findOne(id);
        return this.prisma.banner.update({
            where: { id },
            data: { isActive: !banner.isActive },
        });
    }
};
exports.BannersService = BannersService;
exports.BannersService = BannersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BannersService);
//# sourceMappingURL=banners.service.js.map