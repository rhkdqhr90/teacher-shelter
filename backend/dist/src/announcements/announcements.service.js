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
exports.AnnouncementsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let AnnouncementsService = class AnnouncementsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createAnnouncementDto, authorId) {
        return this.prisma.announcement.create({
            data: {
                ...createAnnouncementDto,
                authorId,
            },
        });
    }
    async findAll(includeUnpublished = false) {
        const where = includeUnpublished ? {} : { isPublished: true };
        return this.prisma.announcement.findMany({
            where,
            orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        });
    }
    async findOne(id) {
        const announcement = await this.prisma.announcement.findUnique({
            where: { id },
        });
        if (!announcement) {
            throw new common_1.NotFoundException('공지사항을 찾을 수 없습니다.');
        }
        return announcement;
    }
    async update(id, updateAnnouncementDto) {
        await this.findOne(id);
        return this.prisma.announcement.update({
            where: { id },
            data: updateAnnouncementDto,
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.announcement.delete({
            where: { id },
        });
    }
    async togglePin(id) {
        const announcement = await this.findOne(id);
        return this.prisma.announcement.update({
            where: { id },
            data: { isPinned: !announcement.isPinned },
        });
    }
    async togglePublish(id) {
        const announcement = await this.findOne(id);
        return this.prisma.announcement.update({
            where: { id },
            data: { isPublished: !announcement.isPublished },
        });
    }
};
exports.AnnouncementsService = AnnouncementsService;
exports.AnnouncementsService = AnnouncementsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnnouncementsService);
//# sourceMappingURL=announcements.service.js.map