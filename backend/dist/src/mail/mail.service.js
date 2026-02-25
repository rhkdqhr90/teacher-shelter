"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nest_winston_1 = require("nest-winston");
const nodemailer = __importStar(require("nodemailer"));
function escapeHtml(text) {
    const htmlEscapes = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    };
    return text.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}
let MailService = class MailService {
    configService;
    logger;
    transporter;
    fromEmail;
    fromName;
    frontendUrl;
    constructor(configService, logger) {
        this.configService = configService;
        this.logger = logger;
        this.fromEmail = this.configService.get('MAIL_FROM') || 'noreply@example.com';
        this.fromName = this.configService.get('MAIL_FROM_NAME') || 'Service';
        this.frontendUrl = this.configService.get('frontendUrl') || 'http://localhost:3001';
        const smtpHost = this.configService.get('SMTP_HOST');
        const smtpPort = this.configService.get('SMTP_PORT') || 587;
        const smtpUser = this.configService.get('SMTP_USER');
        const smtpPass = this.configService.get('SMTP_PASS');
        if (smtpHost && smtpUser && smtpPass) {
            this.transporter = nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpPort === 465,
                auth: {
                    user: smtpUser,
                    pass: smtpPass,
                },
            });
        }
        else {
            this.transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                auth: {
                    user: 'ethereal.user@ethereal.email',
                    pass: 'ethereal.pass',
                },
            });
            if (this.configService.get('isDevelopment')) {
                this.logger.log('Using development mode - emails will be logged', 'MailService');
            }
        }
    }
    async sendPasswordResetEmail(email, token, nickname) {
        const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #eee; }
          .content { padding: 30px 0; }
          .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; }
          .footer { padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
          .warning { background-color: #FEF3C7; padding: 12px; border-radius: 6px; margin-top: 20px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏫 교사쉼터</h1>
          </div>
          <div class="content">
            <p>안녕하세요, <strong>${escapeHtml(nickname)}</strong>님!</p>
            <p>비밀번호 재설정을 요청하셨습니다. 아래 버튼을 클릭하여 새 비밀번호를 설정해주세요.</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" class="button">비밀번호 재설정</a>
            </p>
            <p>버튼이 작동하지 않으면 아래 링크를 브라우저에 복사해서 붙여넣으세요:</p>
            <p style="word-break: break-all; color: #4F46E5;">${resetUrl}</p>
            <div class="warning">
              ⚠️ 이 링크는 <strong>1시간</strong> 후에 만료됩니다.<br>
              비밀번호 재설정을 요청하지 않으셨다면 이 이메일을 무시하셔도 됩니다.
            </div>
          </div>
          <div class="footer">
            <p>본 메일은 발신 전용입니다.</p>
            <p>© ${new Date().getFullYear()} 교사쉼터. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
        const mailOptions = {
            from: `"${this.fromName}" <${this.fromEmail}>`,
            to: email,
            subject: '[교사쉼터] 비밀번호 재설정',
            html,
        };
        if (process.env.NODE_ENV === 'development') {
            this.logger.log(`[DEBUG] Password Reset Email - To: ${email}, Reset URL: ${resetUrl}`, 'MailService');
        }
        try {
            const info = await this.transporter.sendMail(mailOptions);
            if (process.env.NODE_ENV === 'development') {
                const previewUrl = nodemailer.getTestMessageUrl(info);
                if (previewUrl) {
                    this.logger.log(`[DEBUG] Preview URL: ${previewUrl}`, 'MailService');
                }
            }
        }
        catch (error) {
            if (process.env.NODE_ENV === 'development') {
                this.logger.warn?.(`Failed to send email: ${error}. Continuing anyway in development mode`, 'MailService');
            }
            else {
                throw error;
            }
        }
    }
    async sendEmailVerificationCode(email, code, nickname) {
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #eee; }
          .content { padding: 30px 0; }
          .code-box { text-align: center; margin: 30px 0; }
          .code { display: inline-block; padding: 16px 32px; background-color: #F3F4F6; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4F46E5; font-family: monospace; }
          .footer { padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
          .warning { background-color: #FEF3C7; padding: 12px; border-radius: 6px; margin-top: 20px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏫 교사쉼터</h1>
          </div>
          <div class="content">
            <p>안녕하세요, <strong>${escapeHtml(nickname)}</strong>님!</p>
            <p>교사쉼터 회원가입을 완료하려면 아래 인증 코드를 입력해주세요.</p>
            <div class="code-box">
              <span class="code">${code}</span>
            </div>
            <div class="warning">
              ⚠️ 이 코드는 <strong>10분</strong> 후에 만료됩니다.<br>
              본인이 요청하지 않았다면 이 이메일을 무시하세요.
            </div>
          </div>
          <div class="footer">
            <p>본 메일은 발신 전용입니다.</p>
            <p>© ${new Date().getFullYear()} 교사쉼터. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
        const mailOptions = {
            from: `"${this.fromName}" <${this.fromEmail}>`,
            to: email,
            subject: '[교사쉼터] 이메일 인증',
            html,
        };
        if (process.env.NODE_ENV === 'development') {
            this.logger.log(`[DEBUG] Email Verification Code - To: ${email}, Code: ${code}`, 'MailService');
        }
        try {
            const info = await this.transporter.sendMail(mailOptions);
            if (process.env.NODE_ENV === 'development') {
                const previewUrl = nodemailer.getTestMessageUrl(info);
                if (previewUrl) {
                    this.logger.log(`[DEBUG] Preview URL: ${previewUrl}`, 'MailService');
                }
            }
        }
        catch (error) {
            if (process.env.NODE_ENV === 'development') {
                this.logger.warn?.(`Failed to send email: ${error}. Continuing anyway in development mode`, 'MailService');
            }
            else {
                throw error;
            }
        }
    }
    async sendInquiryNotification(inquiry) {
        const adminEmail = this.configService.get('ADMIN_EMAIL') || this.fromEmail;
        const inquiryTypeLabels = {
            GENERAL: '일반 문의',
            ACCOUNT: '계정 관련',
            REPORT: '신고/불편 사항',
            SUGGESTION: '서비스 제안',
            PARTNERSHIP: '제휴/협력 문의',
            OTHER: '기타',
        };
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #eee; }
          .content { padding: 30px 0; }
          .info-box { background-color: #F3F4F6; padding: 16px; border-radius: 8px; margin: 20px 0; }
          .info-row { margin: 8px 0; }
          .label { font-weight: 600; color: #666; }
          .footer { padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏫 교사쉼터 - 새 문의 접수</h1>
          </div>
          <div class="content">
            <p>새로운 고객 문의가 접수되었습니다.</p>
            <div class="info-box">
              <div class="info-row"><span class="label">문의 ID:</span> ${escapeHtml(inquiry.id)}</div>
              <div class="info-row"><span class="label">유형:</span> ${escapeHtml(inquiryTypeLabels[inquiry.type] || inquiry.type)}</div>
              <div class="info-row"><span class="label">이메일:</span> ${escapeHtml(inquiry.email)}</div>
              <div class="info-row"><span class="label">제목:</span> ${escapeHtml(inquiry.subject)}</div>
            </div>
            <p><strong>내용:</strong></p>
            <p style="white-space: pre-wrap; background: #f9f9f9; padding: 16px; border-radius: 8px;">${escapeHtml(inquiry.content)}</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} 교사쉼터. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
        const mailOptions = {
            from: `"${this.fromName}" <${this.fromEmail}>`,
            to: adminEmail,
            subject: `[교사쉼터 문의] ${inquiry.subject}`,
            html,
        };
        if (process.env.NODE_ENV === 'development') {
            this.logger.log(`[DEBUG] New Inquiry - ID: ${inquiry.id}, Type: ${inquiry.type}, From: ${inquiry.email}, Subject: ${inquiry.subject}`, 'MailService');
        }
        try {
            await this.transporter.sendMail(mailOptions);
        }
        catch (error) {
            if (process.env.NODE_ENV === 'development') {
                this.logger.warn?.(`Failed to send inquiry notification: ${error}`, 'MailService');
            }
            else {
                throw error;
            }
        }
    }
    async sendInquiryResponse(inquiry) {
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #eee; }
          .content { padding: 30px 0; }
          .original { background-color: #F3F4F6; padding: 16px; border-radius: 8px; margin: 20px 0; font-size: 14px; color: #666; }
          .response { background-color: #EEF2FF; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4F46E5; }
          .footer { padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏫 교사쉼터</h1>
          </div>
          <div class="content">
            <p>안녕하세요!</p>
            <p>문의하신 내용에 대해 답변 드립니다.</p>

            <p><strong>원본 문의:</strong></p>
            <div class="original">
              <p><strong>${escapeHtml(inquiry.subject)}</strong></p>
              <p style="white-space: pre-wrap;">${escapeHtml(inquiry.content)}</p>
            </div>

            <p><strong>답변:</strong></p>
            <div class="response">
              <p style="white-space: pre-wrap;">${escapeHtml(inquiry.response || '')}</p>
            </div>

            <p>추가 문의사항이 있으시면 언제든 연락해 주세요.</p>
            <p>감사합니다.</p>
          </div>
          <div class="footer">
            <p>본 메일은 발신 전용입니다.</p>
            <p>© ${new Date().getFullYear()} 교사쉼터. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
        const mailOptions = {
            from: `"${this.fromName}" <${this.fromEmail}>`,
            to: inquiry.email,
            subject: `[교사쉼터] 문의 답변: ${inquiry.subject}`,
            html,
        };
        if (process.env.NODE_ENV === 'development') {
            this.logger.log(`[DEBUG] Inquiry Response - To: ${inquiry.email}, Subject: ${inquiry.subject}`, 'MailService');
        }
        try {
            await this.transporter.sendMail(mailOptions);
        }
        catch (error) {
            if (process.env.NODE_ENV === 'development') {
                this.logger.warn?.(`Failed to send inquiry response: ${error}`, 'MailService');
            }
            else {
                throw error;
            }
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(nest_winston_1.WINSTON_MODULE_NEST_PROVIDER)),
    __metadata("design:paramtypes", [config_1.ConfigService, Object])
], MailService);
//# sourceMappingURL=mail.service.js.map