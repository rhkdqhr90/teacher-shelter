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
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptBuffer = encryptBuffer;
exports.decryptBuffer = decryptBuffer;
exports.encryptAndSaveFile = encryptAndSaveFile;
exports.readAndDecryptFile = readAndDecryptFile;
exports.isEncryptionEnabled = isEncryptionEnabled;
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;
const KEY_LENGTH = 32;
const FILE_FORMAT_VERSION = 2;
const VERSION_LENGTH = 1;
function getMasterKey() {
    const envKey = process.env.FILE_ENCRYPTION_KEY;
    if (!envKey) {
        throw new Error('FILE_ENCRYPTION_KEY 환경변수가 설정되지 않았습니다');
    }
    return envKey;
}
function deriveKey(salt) {
    const masterKey = getMasterKey();
    return crypto.scryptSync(masterKey, salt, KEY_LENGTH);
}
function encryptBuffer(buffer) {
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = deriveKey(salt);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    const authTag = cipher.getAuthTag();
    const version = Buffer.from([FILE_FORMAT_VERSION]);
    return Buffer.concat([version, salt, iv, authTag, encrypted]);
}
function decryptBuffer(encryptedBuffer) {
    const version = encryptedBuffer[0];
    if (version === FILE_FORMAT_VERSION) {
        const salt = encryptedBuffer.subarray(VERSION_LENGTH, VERSION_LENGTH + SALT_LENGTH);
        const key = deriveKey(salt);
        const ivStart = VERSION_LENGTH + SALT_LENGTH;
        const iv = encryptedBuffer.subarray(ivStart, ivStart + IV_LENGTH);
        const authTag = encryptedBuffer.subarray(ivStart + IV_LENGTH, ivStart + IV_LENGTH + AUTH_TAG_LENGTH);
        const encrypted = encryptedBuffer.subarray(ivStart + IV_LENGTH + AUTH_TAG_LENGTH);
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        return Buffer.concat([decipher.update(encrypted), decipher.final()]);
    }
    else {
        const legacySalt = 'verification-salt';
        const masterKey = getMasterKey();
        const key = crypto.scryptSync(masterKey, legacySalt, KEY_LENGTH);
        const iv = encryptedBuffer.subarray(0, IV_LENGTH);
        const authTag = encryptedBuffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
        const encrypted = encryptedBuffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        return Buffer.concat([decipher.update(encrypted), decipher.final()]);
    }
}
async function encryptAndSaveFile(buffer, filePath) {
    const encryptedBuffer = encryptBuffer(buffer);
    await fs.promises.writeFile(filePath, encryptedBuffer);
}
async function readAndDecryptFile(filePath) {
    const encryptedBuffer = await fs.promises.readFile(filePath);
    return decryptBuffer(encryptedBuffer);
}
function isEncryptionEnabled() {
    return !!process.env.FILE_ENCRYPTION_KEY;
}
//# sourceMappingURL=file-encryption.util.js.map