import { Prisma } from '@prisma/client';
type PrismaTransactionClient = Prisma.TransactionClient;
export declare function safeDecrementCommentCount(tx: PrismaTransactionClient, postId: string, decrementBy: number): Promise<void>;
export declare function safeDecrementLikeCount(tx: PrismaTransactionClient, postId: string, decrementBy: number): Promise<void>;
export {};
