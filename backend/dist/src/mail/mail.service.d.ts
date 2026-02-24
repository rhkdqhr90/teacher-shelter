import type { LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private configService;
    private readonly logger;
    private transporter;
    private readonly fromEmail;
    private readonly fromName;
    private readonly frontendUrl;
    constructor(configService: ConfigService, logger: LoggerService);
    sendPasswordResetEmail(email: string, token: string, nickname: string): Promise<void>;
    sendEmailVerificationCode(email: string, code: string, nickname: string): Promise<void>;
    sendInquiryNotification(inquiry: {
        id: string;
        type: string;
        email: string;
        subject: string;
        content: string;
    }): Promise<void>;
    sendInquiryResponse(inquiry: {
        email: string;
        subject: string;
        content: string;
        response: string | null;
    }): Promise<void>;
}
