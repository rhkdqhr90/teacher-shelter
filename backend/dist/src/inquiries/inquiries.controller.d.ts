import { InquiriesService } from './inquiries.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { RespondInquiryDto } from './dto/respond-inquiry.dto';
import { UpdateInquiryStatusDto } from './dto/update-inquiry-status.dto';
export declare class InquiriesController {
    private readonly inquiriesService;
    constructor(inquiriesService: InquiriesService);
    create(createInquiryDto: CreateInquiryDto, req: {
        user?: {
            sub: string;
        };
    }): Promise<{
        id: string;
        message: string;
    }>;
    findAll(page?: string, limit?: string, status?: string): Promise<{
        data: {
            id: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            userId: string | null;
            type: import("@prisma/client").$Enums.InquiryType;
            status: import("@prisma/client").$Enums.InquiryStatus;
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
        userId: string | null;
        type: import("@prisma/client").$Enums.InquiryType;
        status: import("@prisma/client").$Enums.InquiryStatus;
        subject: string;
        response: string | null;
        respondedAt: Date | null;
        respondedById: string | null;
    } | null>;
    respond(id: string, dto: RespondInquiryDto, req: {
        user: {
            sub: string;
        };
    }): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        userId: string | null;
        type: import("@prisma/client").$Enums.InquiryType;
        status: import("@prisma/client").$Enums.InquiryStatus;
        subject: string;
        response: string | null;
        respondedAt: Date | null;
        respondedById: string | null;
    }>;
    updateStatus(id: string, dto: UpdateInquiryStatusDto): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        userId: string | null;
        type: import("@prisma/client").$Enums.InquiryType;
        status: import("@prisma/client").$Enums.InquiryStatus;
        subject: string;
        response: string | null;
        respondedAt: Date | null;
        respondedById: string | null;
    }>;
}
