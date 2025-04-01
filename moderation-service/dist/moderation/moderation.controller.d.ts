import { ModerationService } from './moderation.service';
import { SubmitForModerationDto } from './dto/submit-for-moderation.dto';
import { ModerateItemDto } from './dto/moderate-item.dto';
import { QueryModerationItemsDto } from './dto/query-moderation-items.dto';
import { ItemType } from '@prisma/client';
export declare class ModerationController {
    private readonly moderationService;
    constructor(moderationService: ModerationService);
    submitForModeration(dto: SubmitForModerationDto, user: any): Promise<{
        id: string;
        itemType: import(".prisma/client").$Enums.ItemType;
        itemId: string;
        status: import(".prisma/client").$Enums.ModerationStatus;
        reason: string | null;
        notes: string | null;
        submittedBy: string;
        moderatedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    moderateItem(id: string, dto: ModerateItemDto, user: any): Promise<{
        id: string;
        itemType: import(".prisma/client").$Enums.ItemType;
        itemId: string;
        status: import(".prisma/client").$Enums.ModerationStatus;
        reason: string | null;
        notes: string | null;
        submittedBy: string;
        moderatedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getModerationItem(id: string): Promise<{
        id: string;
        itemType: import(".prisma/client").$Enums.ItemType;
        itemId: string;
        status: import(".prisma/client").$Enums.ModerationStatus;
        reason: string | null;
        notes: string | null;
        submittedBy: string;
        moderatedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getItemModerationHistory(itemType: ItemType, itemId: string): Promise<{
        id: string;
        itemType: import(".prisma/client").$Enums.ItemType;
        itemId: string;
        status: import(".prisma/client").$Enums.ModerationStatus;
        reason: string | null;
        notes: string | null;
        submittedBy: string;
        moderatedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    queryModerationItems(query: QueryModerationItemsDto): Promise<{
        items: {
            id: string;
            itemType: import(".prisma/client").$Enums.ItemType;
            itemId: string;
            status: import(".prisma/client").$Enums.ModerationStatus;
            reason: string | null;
            notes: string | null;
            submittedBy: string;
            moderatedBy: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
}
