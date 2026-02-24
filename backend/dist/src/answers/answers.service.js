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
exports.AnswersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let AnswersService = class AnswersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(postId, userId, createAnswerDto) {
        const post = await this.prisma.post.findUnique({
            where: { id: postId },
            select: { id: true, category: true },
        });
        if (!post) {
            throw new common_1.NotFoundException('게시글을 찾을 수 없습니다');
        }
        if (post.category !== 'LEGAL_QNA') {
            throw new common_1.BadRequestException('법률 Q&A 게시글에만 답변할 수 있습니다');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { isExpert: true, expertType: true },
        });
        if (!user?.isExpert) {
            throw new common_1.ForbiddenException('인증된 전문가만 답변할 수 있습니다');
        }
        const answer = await this.prisma.answer.create({
            data: {
                content: createAnswerDto.content,
                postId,
                authorId: userId,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        nickname: true,
                        isExpert: true,
                        expertType: true,
                        profileImage: true,
                    },
                },
            },
        });
        return answer;
    }
    async findByPostId(postId) {
        const answers = await this.prisma.answer.findMany({
            where: { postId },
            orderBy: [
                { isBest: 'desc' },
                { createdAt: 'asc' },
            ],
            include: {
                author: {
                    select: {
                        id: true,
                        nickname: true,
                        isExpert: true,
                        expertType: true,
                        profileImage: true,
                    },
                },
            },
        });
        return answers;
    }
    async update(answerId, userId, updateAnswerDto) {
        const answer = await this.prisma.answer.findUnique({
            where: { id: answerId },
            select: { authorId: true },
        });
        if (!answer) {
            throw new common_1.NotFoundException('답변을 찾을 수 없습니다');
        }
        if (answer.authorId !== userId) {
            throw new common_1.ForbiddenException('본인의 답변만 수정할 수 있습니다');
        }
        return this.prisma.answer.update({
            where: { id: answerId },
            data: updateAnswerDto,
            include: {
                author: {
                    select: {
                        id: true,
                        nickname: true,
                        isExpert: true,
                        expertType: true,
                        profileImage: true,
                    },
                },
            },
        });
    }
    async remove(answerId, userId, isAdmin = false) {
        const answer = await this.prisma.answer.findUnique({
            where: { id: answerId },
            select: { authorId: true },
        });
        if (!answer) {
            throw new common_1.NotFoundException('답변을 찾을 수 없습니다');
        }
        if (!isAdmin && answer.authorId !== userId) {
            throw new common_1.ForbiddenException('본인의 답변만 삭제할 수 있습니다');
        }
        await this.prisma.answer.delete({
            where: { id: answerId },
        });
    }
    async selectBest(answerId, userId) {
        const answer = await this.prisma.answer.findUnique({
            where: { id: answerId },
            include: {
                post: {
                    select: { authorId: true, anonymousAuthorId: true },
                },
            },
        });
        if (!answer) {
            throw new common_1.NotFoundException('답변을 찾을 수 없습니다');
        }
        const postAuthorId = answer.post.authorId || answer.post.anonymousAuthorId;
        if (postAuthorId !== userId) {
            throw new common_1.ForbiddenException('질문 작성자만 베스트 답변을 선택할 수 있습니다');
        }
        await this.prisma.$transaction([
            this.prisma.answer.updateMany({
                where: {
                    postId: answer.postId,
                    isBest: true,
                },
                data: {
                    isBest: false,
                    bestSelectedAt: null,
                },
            }),
            this.prisma.answer.update({
                where: { id: answerId },
                data: {
                    isBest: true,
                    bestSelectedAt: new Date(),
                },
            }),
        ]);
        return this.prisma.answer.findUnique({
            where: { id: answerId },
            include: {
                author: {
                    select: {
                        id: true,
                        nickname: true,
                        isExpert: true,
                        expertType: true,
                        profileImage: true,
                    },
                },
            },
        });
    }
};
exports.AnswersService = AnswersService;
exports.AnswersService = AnswersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnswersService);
//# sourceMappingURL=answers.service.js.map