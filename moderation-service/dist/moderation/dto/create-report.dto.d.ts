import { ItemType } from '@prisma/client';
export declare class CreateReportDto {
    itemType: ItemType;
    itemId: string;
    reason: string;
    description?: string;
}
