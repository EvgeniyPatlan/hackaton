import { ModerationRepository } from './moderation.repository';
import { ItemType } from '@prisma/client';
import { SubmitForModerationDto } from './dto/submit-for-moderation.dto';
import { ModerateItemDto } from './dto/moderate-item.dto';
import { QueryModerationItemsDto } from './dto/query-moderation-items.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export declare class ModerationService {
    private moderationRepository;
    private httpService;
    private configService;
    private readonly logger;
    constructor(moderationRepository: ModerationRepository, httpService: HttpService, configService: ConfigService);
    submitForModeration(dto: SubmitForModerationDto, submittedBy: string): Promise<{
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
    moderateItem(id: string, dto: ModerateItemDto, moderatedBy: string): Promise<{
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
    private notifyServiceAboutModeration;
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
