export declare function encryptBuffer(buffer: Buffer): Buffer;
export declare function decryptBuffer(encryptedBuffer: Buffer): Buffer;
export declare function encryptAndSaveFile(buffer: Buffer, filePath: string): Promise<void>;
export declare function readAndDecryptFile(filePath: string): Promise<Buffer>;
export declare function isEncryptionEnabled(): boolean;
