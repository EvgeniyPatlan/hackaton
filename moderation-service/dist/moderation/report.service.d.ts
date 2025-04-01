import { ModerationRepository } from './moderation.repository';
import { CreateReportDto } from './dto/create-report.dto';
import { ResolveReportDto } from './dto/resolve-report.dto';
import { QueryReportsDto } from './dto/query-reports.dto';
export declare class ReportService {
    private moderationRepository;
    private readonly logger;
    constructor(moderationRepository: ModerationRepository);
    createReport(dto: CreateReportDto, reportedBy: string): Promise<{
        id: string;
        itemType: import(".prisma/client").$Enums.ItemType;
        itemId: string;
        status: import(".prisma/client").$Enums.ReportStatus;
        reason: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        reportedBy: string;
        resolvedBy: string | null;
        resolution: string | null;
    }>;
    resolveReport(id: string, dto: ResolveReportDto, resolvedBy: string): Promise<{
        id: string;
        itemType: import(".prisma/client").$Enums.ItemType;
        itemId: string;
        status: import(".prisma/client").$Enums.ReportStatus;
        reason: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        reportedBy: string;
        resolvedBy: string | null;
        resolution: string | null;
    }>;
    getReport(id: string): Promise<{
        id: string;
        itemType: import(".prisma/client").$Enums.ItemType;
        itemId: string;
        status: import(".prisma/client").$Enums.ReportStatus;
        reason: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        reportedBy: string;
        resolvedBy: string | null;
        resolution: string | null;
    }>;
    queryReports(query: QueryReportsDto): Promise<{
        reports: {
            id: string;
            itemType: import(".prisma/client").$Enums.ItemType;
            itemId: string;
            status: import(".prisma/client").$Enums.ReportStatus;
            reason: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            reportedBy: string;
            resolvedBy: string | null;
            resolution: string | null;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
}
