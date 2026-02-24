import { VerificationStatus } from '@prisma/client';
export declare class ProcessVerificationDto {
    status: VerificationStatus;
    rejectionReason?: string;
}
