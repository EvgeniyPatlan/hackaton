import { ItemType, ModerationStatus } from '@prisma/client';
export declare class QueryModerationItemsDto {
    status?: ModerationStatus;
    itemType?: ItemType;
    page?: number;
    limit?: number;
}
