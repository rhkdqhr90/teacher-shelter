import { PostCategory } from '@prisma/client';
export declare class CreateAutoContentDto {
    title: string;
    content: string;
    category: PostCategory;
    status?: string;
    sourceUrl?: string;
    sourceName?: string;
    confidence?: string;
}
