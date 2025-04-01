import { PrismaService } from '../prisma/prisma.service';
import { ModerationItem, ModerationHistory, Report, Prisma, ItemType } from '@prisma/client';
export declare class ModerationRepository {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createModerationItem(data: Prisma.ModerationItemCreateInput): Promise<ModerationItem>;
    findModerationItemById(id: string): Promise<ModerationItem | null>;
    findModerationItemsByItemId(itemType: ItemType, itemId: string): Promise<ModerationItem[]>;
    updateModerationItem(id: string, data: Prisma.ModerationItemUpdateInput): Promise<ModerationItem>;
    findModerationItems(params: {
        skip?: number;
        take?: number;
        where?: Prisma.ModerationItemWhereInput;
        orderBy?: Prisma.ModerationItemOrderByWithRelationInput;
    }): Promise<ModerationItem[]>;
    countModerationItems(where?: Prisma.ModerationItemWhereInput): Promise<number>;
    createModerationHistory(data: Prisma.ModerationHistoryCreateInput): Promise<ModerationHistory>;
    createReport(data: Prisma.ReportCreateInput): Promise<Report>;
    findReportById(id: string): Promise<Report | null>;
    updateReport(id: string, data: Prisma.ReportUpdateInput): Promise<Report>;
    findReports(params: {
        skip?: number;
        take?: number;
        where?: Prisma.ReportWhereInput;
        orderBy?: Prisma.ReportOrderByWithRelationInput;
    }): Promise<Report[]>;
    countReports(where?: Prisma.ReportWhereInput): Promise<number>;
}
