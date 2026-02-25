import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
export declare class AnnouncementsController {
    private readonly announcementsService;
    constructor(announcementsService: AnnouncementsService);
    create(createAnnouncementDto: CreateAnnouncementDto, req: {
        user: {
            sub: string;
        };
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        authorId: string | null;
        isPinned: boolean;
        isPublished: boolean;
    }>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        authorId: string | null;
        isPinned: boolean;
        isPublished: boolean;
    }[]>;
    findAllAdmin(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        authorId: string | null;
        isPinned: boolean;
        isPublished: boolean;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        authorId: string | null;
        isPinned: boolean;
        isPublished: boolean;
    }>;
    update(id: string, updateAnnouncementDto: UpdateAnnouncementDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        authorId: string | null;
        isPinned: boolean;
        isPublished: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        authorId: string | null;
        isPinned: boolean;
        isPublished: boolean;
    }>;
    togglePin(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        authorId: string | null;
        isPinned: boolean;
        isPublished: boolean;
    }>;
    togglePublish(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        authorId: string | null;
        isPinned: boolean;
        isPublished: boolean;
    }>;
}
