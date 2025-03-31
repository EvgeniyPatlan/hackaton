import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ModerationRepository } from './moderation.repository';
import { ReportStatus } from '@prisma/client';
import { CreateReportDto } from './dto/create-report.dto';
import { ResolveReportDto } from './dto/resolve-report.dto';
import { QueryReportsDto } from './dto/query-reports.dto';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(private moderationRepository: ModerationRepository) {}

  async createReport(dto: CreateReportDto, reportedBy: string) {
    try {
      const newReport = await this.moderationRepository.createReport({
        itemType: dto.itemType,
        itemId: dto.itemId,
        reason: dto.reason,
        description: dto.description,
        reportedBy,
        status: ReportStatus.PENDING,
      });

      return newReport;
    } catch (error) {
      this.logger.error(`Failed to create report: ${error.message}`);
      throw new BadRequestException(`Failed to create report: ${error.message}`);
    }
  }

  async resolveReport(id: string, dto: ResolveReportDto, resolvedBy: string) {
    const report = await this.moderationRepository.findReportById(id);
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    if (report.status !== ReportStatus.PENDING) {
      throw new BadRequestException(
        `Cannot resolve report that is already ${report.status}`,
      );
    }

    return this.moderationRepository.updateReport(id, {
      status: dto.status,
      resolution: dto.resolution,
      resolvedBy,
    });
  }

  async getReport(id: string) {
    const report = await this.moderationRepository.findReportById(id);
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    return report;
  }

  async queryReports(query: QueryReportsDto) {
    const { status, itemType, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (itemType) {
      where.itemType = itemType;
    }

    const [reports, total] = await Promise.all([
      this.moderationRepository.findReports({
        skip,
        take: limit,
        where,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.moderationRepository.countReports(where),
    ]);

    return {
      reports,
      total,
      page,
      limit,
    };
  }
}
