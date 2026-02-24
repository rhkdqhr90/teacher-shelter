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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsService = void 0;
const common_1 = require("@nestjs/common");
const nest_winston_1 = require("nest-winston");
const prisma_service_1 = require("../database/prisma.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const sharp_1 = __importDefault(require("sharp"));
const file_encryption_util_1 = require("../common/utils/file-encryption.util");
const OPTIMIZATION_PRESETS = {
    profile: {
        maxWidth: 400,
        maxHeight: 400,
        quality: 80,
        format: 'webp',
    },
    post: {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 85,
        format: 'webp',
    },
    verification: {
        maxWidth: 2000,
        maxHeight: 2000,
        quality: 95,
        format: 'jpeg',
    },
    banner: {
        maxWidth: 1920,
        maxHeight: 600,
        quality: 90,
        format: 'webp',
    },
};
let UploadsService = class UploadsService {
    prisma;
    logger;
    uploadDir;
    maxFileSize = 5 * 1024 * 1024;
    allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
    ];
    allowedExtensions = [
        '.jpg',
        '.jpeg',
        '.png',
        '.gif',
        '.webp',
    ];
    documentMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    documentExtensions = ['.pdf', '.doc', '.docx'];
    verificationMaxFileSize = 10 * 1024 * 1024;
    imageMagicNumbers = [
        { type: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
        {
            type: 'image/png',
            bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
        },
        { type: 'image/gif', bytes: [0x47, 0x49, 0x46, 0x38] },
        { type: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46] },
    ];
    documentMagicNumbers = [
        { type: 'application/pdf', bytes: [0x25, 0x50, 0x44, 0x46] },
        { type: 'application/msword', bytes: [0xd0, 0xcf, 0x11, 0xe0] },
        {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            bytes: [0x50, 0x4b, 0x03, 0x04],
        },
    ];
    constructor(prisma, logger) {
        this.prisma = prisma;
        this.logger = logger;
        this.uploadDir = path.join(process.cwd(), 'uploads');
        this.ensureUploadDirs();
    }
    ensureUploadDirs() {
        const dirs = ['profile', 'post', 'verification', 'banner'];
        dirs.forEach((dir) => {
            const fullPath = path.join(this.uploadDir, dir);
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
            }
        });
    }
    validateMagicNumber(buffer) {
        if (!buffer || buffer.length < 12) {
            return false;
        }
        for (const magic of this.imageMagicNumbers) {
            if (buffer.length < magic.bytes.length) {
                continue;
            }
            let matches = true;
            for (let i = 0; i < magic.bytes.length; i++) {
                if (buffer[i] !== magic.bytes[i]) {
                    matches = false;
                    break;
                }
            }
            if (matches) {
                if (magic.type === 'image/webp') {
                    const webpSignature = buffer.subarray(8, 12).toString('ascii');
                    if (webpSignature !== 'WEBP') {
                        continue;
                    }
                }
                return true;
            }
        }
        return false;
    }
    validateFile(file) {
        if (!file) {
            throw new common_1.BadRequestException('파일이 없습니다');
        }
        if (file.size > this.maxFileSize) {
            throw new common_1.BadRequestException('파일 크기는 5MB를 초과할 수 없습니다');
        }
        if (!this.allowedMimeTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException('허용되지 않는 파일 형식입니다. (JPEG, PNG, GIF, WebP만 허용)');
        }
        const ext = path.extname(file.originalname).toLowerCase();
        if (!this.allowedExtensions.includes(ext)) {
            throw new common_1.BadRequestException('허용되지 않는 파일 확장자입니다. (jpg, jpeg, png, gif, webp만 허용)');
        }
        if (!this.validateMagicNumber(file.buffer)) {
            throw new common_1.BadRequestException('유효하지 않은 이미지 파일입니다. 파일이 손상되었거나 위조되었을 수 있습니다.');
        }
    }
    async optimizeImage(buffer, type, originalMimetype) {
        const options = OPTIMIZATION_PRESETS[type];
        if (originalMimetype === 'image/gif') {
            return { buffer, format: 'gif' };
        }
        try {
            let pipeline = (0, sharp_1.default)(buffer);
            const metadata = await pipeline.metadata();
            if (metadata.width &&
                metadata.height &&
                (metadata.width > options.maxWidth ||
                    metadata.height > options.maxHeight)) {
                pipeline = pipeline.resize(options.maxWidth, options.maxHeight, {
                    fit: 'inside',
                    withoutEnlargement: true,
                });
            }
            pipeline = pipeline.rotate();
            let optimizedBuffer;
            if (options.format === 'webp') {
                optimizedBuffer = await pipeline
                    .webp({ quality: options.quality })
                    .toBuffer();
            }
            else if (options.format === 'jpeg') {
                optimizedBuffer = await pipeline
                    .jpeg({ quality: options.quality })
                    .toBuffer();
            }
            else {
                optimizedBuffer = await pipeline
                    .png({ quality: options.quality })
                    .toBuffer();
            }
            this.logger.log(`Image optimized: ${buffer.length} bytes -> ${optimizedBuffer.length} bytes (${Math.round((1 - optimizedBuffer.length / buffer.length) * 100)}% reduction)`, 'UploadsService');
            return { buffer: optimizedBuffer, format: options.format };
        }
        catch (error) {
            this.logger.warn(`Image optimization failed, using original: ${error}`, 'UploadsService');
            const ext = originalMimetype.split('/')[1] || 'jpeg';
            return { buffer, format: ext };
        }
    }
    async saveFile(file, type, userId) {
        this.validateFile(file);
        if (!userId || !/^[a-zA-Z0-9_-]+$/.test(userId)) {
            throw new common_1.BadRequestException('유효하지 않은 사용자 ID입니다');
        }
        const validTypes = ['profile', 'post', 'verification', 'banner'];
        if (!validTypes.includes(type)) {
            throw new common_1.BadRequestException('유효하지 않은 업로드 타입입니다');
        }
        const { buffer: optimizedBuffer, format } = await this.optimizeImage(file.buffer, type, file.mimetype);
        const timestamp = Date.now();
        const random = crypto.randomBytes(8).toString('hex');
        const safeFormat = format.replace(/[^a-z0-9]/gi, '');
        const filename = `${userId}_${timestamp}_${random}.${safeFormat}`;
        const typeDir = path.resolve(this.uploadDir, type);
        const filePath = path.resolve(typeDir, filename);
        if (!filePath.startsWith(typeDir + path.sep)) {
            throw new common_1.BadRequestException('잘못된 파일 경로입니다');
        }
        await fs.promises.writeFile(filePath, optimizedBuffer);
        return `/uploads/${type}/${filename}`;
    }
    async updateProfileImage(userId, file) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { profileImage: true },
        });
        const imageUrl = await this.saveFile(file, 'profile', userId);
        await this.prisma.user.update({
            where: { id: userId },
            data: { profileImage: imageUrl },
        });
        if (user?.profileImage) {
            await this.deleteFile(user.profileImage);
        }
        return { imageUrl };
    }
    async deleteFile(fileUrl) {
        try {
            const relativePath = fileUrl.replace('/uploads/', '');
            const filePath = path.join(this.uploadDir, relativePath);
            const normalizedPath = path.normalize(filePath);
            if (!normalizedPath.startsWith(this.uploadDir + path.sep)) {
                this.logger.warn(`Path traversal attempt detected: ${fileUrl}`, 'UploadsService');
                return;
            }
            if (fs.existsSync(normalizedPath)) {
                await fs.promises.unlink(normalizedPath);
            }
        }
        catch (error) {
            this.logger.error('Failed to delete file', error, 'UploadsService');
        }
    }
    async deleteProfileImage(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { profileImage: true },
        });
        if (user?.profileImage) {
            await this.deleteFile(user.profileImage);
            await this.prisma.user.update({
                where: { id: userId },
                data: { profileImage: null },
            });
        }
        return { message: '프로필 이미지가 삭제되었습니다' };
    }
    validateDocumentMagicNumber(buffer, mimetype) {
        if (!buffer || buffer.length < 4) {
            return false;
        }
        for (const magic of this.documentMagicNumbers) {
            if (buffer.length < magic.bytes.length) {
                continue;
            }
            let matches = true;
            for (let i = 0; i < magic.bytes.length; i++) {
                if (buffer[i] !== magic.bytes[i]) {
                    matches = false;
                    break;
                }
            }
            if (matches) {
                if (magic.type === 'application/pdf' &&
                    mimetype === 'application/pdf') {
                    return true;
                }
                if (magic.type === 'application/msword' &&
                    mimetype === 'application/msword') {
                    return true;
                }
                if (magic.type ===
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' &&
                    mimetype ===
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                    return true;
                }
            }
        }
        return false;
    }
    validateVerificationFile(file) {
        if (!file) {
            throw new common_1.BadRequestException('파일이 없습니다');
        }
        if (file.size > this.verificationMaxFileSize) {
            throw new common_1.BadRequestException('파일 크기는 10MB를 초과할 수 없습니다');
        }
        const ext = path.extname(file.originalname).toLowerCase();
        if (this.allowedMimeTypes.includes(file.mimetype)) {
            if (!this.allowedExtensions.includes(ext)) {
                throw new common_1.BadRequestException('허용되지 않는 파일 확장자입니다');
            }
            if (!this.validateMagicNumber(file.buffer)) {
                throw new common_1.BadRequestException('유효하지 않은 이미지 파일입니다');
            }
            return;
        }
        if (this.documentMimeTypes.includes(file.mimetype)) {
            if (!this.documentExtensions.includes(ext)) {
                throw new common_1.BadRequestException('허용되지 않는 파일 확장자입니다');
            }
            if (!this.validateDocumentMagicNumber(file.buffer, file.mimetype)) {
                throw new common_1.BadRequestException('유효하지 않은 문서 파일입니다');
            }
            return;
        }
        throw new common_1.BadRequestException('허용되지 않는 파일 형식입니다. (JPEG, PNG, GIF, WebP, PDF, DOC, DOCX만 허용)');
    }
    async saveVerificationFile(file, userId) {
        this.validateVerificationFile(file);
        const timestamp = Date.now();
        const random = crypto.randomBytes(8).toString('hex');
        const ext = path.extname(file.originalname).toLowerCase();
        const shouldEncrypt = (0, file_encryption_util_1.isEncryptionEnabled)();
        const filename = shouldEncrypt
            ? `${userId}_${timestamp}_${random}${ext}.enc`
            : `${userId}_${timestamp}_${random}${ext}`;
        const filePath = path.join(this.uploadDir, 'verification', filename);
        if (shouldEncrypt) {
            const encryptedBuffer = (0, file_encryption_util_1.encryptBuffer)(file.buffer);
            await fs.promises.writeFile(filePath, encryptedBuffer);
            this.logger.log(`Verification file saved (encrypted): ${filename} (${file.size} bytes -> ${encryptedBuffer.length} bytes)`, 'UploadsService');
        }
        else {
            await fs.promises.writeFile(filePath, file.buffer);
            this.logger.log(`Verification file saved: ${filename} (${file.size} bytes)`, 'UploadsService');
        }
        return {
            fileUrl: `/uploads/verification/${filename}`,
            originalFileName: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
            isEncrypted: shouldEncrypt,
        };
    }
    async readVerificationFile(fileUrl, isEncrypted) {
        let filename = fileUrl.replace('/uploads/verification/', '');
        try {
            filename = decodeURIComponent(filename);
        }
        catch {
            throw new common_1.BadRequestException('잘못된 파일 경로입니다');
        }
        const uploadsDir = path.resolve(this.uploadDir, 'verification');
        const filePath = path.resolve(uploadsDir, path.basename(filename));
        if (!filePath.startsWith(uploadsDir + path.sep)) {
            throw new common_1.BadRequestException('잘못된 파일 경로입니다');
        }
        if (!fs.existsSync(filePath)) {
            throw new common_1.BadRequestException('파일을 찾을 수 없습니다');
        }
        const fileBuffer = await fs.promises.readFile(filePath);
        if (isEncrypted) {
            return (0, file_encryption_util_1.decryptBuffer)(fileBuffer);
        }
        return fileBuffer;
    }
};
exports.UploadsService = UploadsService;
exports.UploadsService = UploadsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(nest_winston_1.WINSTON_MODULE_NEST_PROVIDER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], UploadsService);
//# sourceMappingURL=uploads.service.js.map