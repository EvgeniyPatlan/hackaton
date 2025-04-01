import { ItemType, ReportStatus } from '@prisma/client';
export declare class QueryReportsDto {
    status?: ReportStatus;
    itemType?: ItemType;
    page?: number;
    limit?: number;
}
