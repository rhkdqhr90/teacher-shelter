import type { LoggerService } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { InquiryStatus } from '@prisma/client';
export declare class InquiriesService {
    private prisma;
    private mailService;
    private readonly logger;
    constructor(prisma: PrismaService, mailService: MailService, logger: LoggerService);
    create(createInquiryDto: CreateInquiryDto): Promise<{
        id: string;
        message: string;
    }>;
    findAll(page?: number, limit?: number, status?: InquiryStatus): Promise<{
        data: {
            id: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            status: import("@prisma/client").$Enums.InquiryStatus;
            userId: string | null;
            type: import("@prisma/client").$Enums.InquiryType;
            subject: string;
            response: string | null;
            respondedAt: Date | null;
            respondedById: string | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        status: import("@prisma/client").$Enums.InquiryStatus;
        userId: string | null;
        type: import("@prisma/client").$Enums.InquiryType;
        subject: string;
        response: string | null;
        respondedAt: Date | null;
        respondedById: string | null;
    } | null>;
    respond(id: string, response: string, respondedById: string): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        status: import("@prisma/client").$Enums.InquiryStatus;
        userId: string | null;
        type: import("@prisma/client").$Enums.InquiryType;
        subject: string;
        response: string | null;
        respondedAt: Date | null;
        respondedById: string | null;
    }>;
    updateStatus(id: string, status: InquiryStatus): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        status: import("@prisma/client").$Enums.InquiryStatus;
        userId: string | null;
        type: import("@prisma/client").$Enums.InquiryType;
        subject: string;
        response: string | null;
        respondedAt: Date | null;
        respondedById: string | null;
    }>;
}
