import { InquiryType } from '@prisma/client';
export declare class CreateInquiryDto {
    type: InquiryType;
    email: string;
    subject: string;
    content: string;
    userId?: string;
}
