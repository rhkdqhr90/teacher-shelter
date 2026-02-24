import type { Request } from 'express';
import { AnswersService } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
export declare class AnswersController {
    private readonly answersService;
    constructor(answersService: AnswersService);
    findAll(postId: string): Promise<({
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
    create(postId: string, req: Request, createAnswerDto: CreateAnswerDto): Promise<{
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
    update(answerId: string, req: Request, updateAnswerDto: UpdateAnswerDto): Promise<{
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
    remove(answerId: string, req: Request): Promise<void>;
    selectBest(answerId: string, req: Request): Promise<({
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
