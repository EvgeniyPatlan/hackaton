import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ResolveReportDto } from './dto/resolve-report.dto';
import { QueryReportsDto } from './dto/query-reports.dto';
export declare class ReportController {
    private readonly reportService;
    constructor(reportService: ReportService);
    createReport(dto: CreateReportDto, user: any): Promise<{
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
    resolveReport(id: string, dto: ResolveReportDto, user: any): Promise<{
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
    : any;
}
export declare class ReportController {
    private readonly reportService;
    constructor(reportService: ReportService);
    createReport(dto: CreateReportDto, user: any): Promise<{
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
    resolveReport(id: string, dto: ResolveReportDto, user: any): Promise<{
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
