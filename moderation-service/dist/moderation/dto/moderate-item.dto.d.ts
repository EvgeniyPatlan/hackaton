import { ModerationStatus } from '@prisma/client';
export declare class ModerateItemDto {
    status: ModerationStatus;
    reason?: string;
    notes?: string;
}
