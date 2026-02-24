import { PrismaService } from '../database/prisma.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
export declare class AnswersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(postId: string, userId: string, createAnswerDto: CreateAnswerDto): Promise<{
        author: {
            id: string;
            nickname: string;
            profileImage: string | null;
            isExpert: boolean;
            expertType: import("@prisma/client").$Enums.ExpertType | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        authorId: string;
        postId: string;
        isBest: boolean;
        bestSelectedAt: Date | null;
    }>;
    findByPostId(postId: string): Promise<({
        author: {
            id: string;
            nickname: string;
            profileImage: string | null;
            isExpert: boolean;
            expertType: import("@prisma/client").$Enums.ExpertType | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        authorId: string;
        postId: string;
        isBest: boolean;
        bestSelectedAt: Date | null;
    })[]>;
    update(answerId: string, userId: string, updateAnswerDto: UpdateAnswerDto): Promise<{
        author: {
            id: string;
            nickname: string;
            profileImage: string | null;
            isExpert: boolean;
            expertType: import("@prisma/client").$Enums.ExpertType | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        authorId: string;
        postId: string;
        isBest: boolean;
        bestSelectedAt: Date | null;
    }>;
    remove(answerId: string, userId: string, isAdmin?: boolean): Promise<void>;
    selectBest(answerId: string, userId: string): Promise<({
        author: {
            id: string;
            nickname: string;
            profileImage: string | null;
            isExpert: boolean;
            expertType: import("@prisma/client").$Enums.ExpertType | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        authorId: string;
        postId: string;
        isBest: boolean;
        bestSelectedAt: Date | null;
    }) | null>;
}
