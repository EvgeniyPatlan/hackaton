import { ItemType } from '@prisma/client';
export declare class SubmitForModerationDto {
    itemType: ItemType;
    itemId: string;
    reason?: string;
    notes?: string;
}
