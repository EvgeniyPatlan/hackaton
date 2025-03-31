import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ModerationItem, ModerationHistory, Report, Prisma, ItemType, ModerationStatus, ReportStatus } from '@prisma/client';

@Injectable()
export class ModerationRepository {
  private readonly logger = new Logger(ModerationRepository.name);

  constructor(private prisma: PrismaService) {}

  // Moderation Items
  async createModerationItem(data: Prisma.ModerationItemCreateInput): Promise<ModerationItem> {
    return this.prisma.moderationItem.create({
      data,
      include: {
        history: true,
      },
    });
  }

  async findModerationItemById(id: string): Promise<ModerationItem | null> {
    return this.prisma.moderationItem.findUnique({
      where: { id },
      include: {
        history: true,
      },
    });
  }

  async findModerationItemsByItemId(itemType: ItemType, itemId: string): Promise<ModerationItem[]> {
    return this.prisma.moderationItem.findMany({
      where: {
        itemType,
        itemId,
      },
      include: {
        history: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateModerationItem(
    id: string,
    data: Prisma.ModerationItemUpdateInput,
  ): Promise<ModerationItem> {
    return this.prisma.moderationItem.update({
      where: { id },
      data,
      include: {
        history: true,
      },
    });
  }

  async findModerationItems(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ModerationItemWhereInput;
    orderBy?: Prisma.ModerationItemOrderByWithRelationInput;
  }): Promise<ModerationItem[]> {
    const { skip, take, where, orderBy } = params;
    return this.prisma.moderationItem.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        history: true,
      },
    });
  }

  async countModerationItems(where?: Prisma.ModerationItemWhereInput): Promise<number> {
    return this.prisma.moderationItem.count({ where });
  }

  // Moderation History
  async createModerationHistory(data: Prisma.ModerationHistoryCreateInput): Promise<ModerationHistory> {
    return this.prisma.moderationHistory.create({
      data,
    });
  }

  // Reports
  async createReport(data: Prisma.ReportCreateInput): Promise<Report> {
    return this.prisma.report.create({
      data,
    });
  }

  async findReportById(id: string): Promise<Report | null> {
    return this.prisma.report.findUnique({
      where: { id },
    });
  }

  async updateReport(
    id: string,
    data: Prisma.ReportUpdateInput,
  ): Promise<Report> {
    return this.prisma.report.update({
      where: { id },
      data,
    });
  }

  async findReports(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ReportWhereInput;
    orderBy?: Prisma.ReportOrderByWithRelationInput;
  }): Promise<Report[]> {
    const { skip, take, where, orderBy } = params;
    return this.prisma.report.findMany({
      skip,
      take,
      where,
      orderBy,
    });
  }

  async countReports(where?: Prisma.ReportWhereInput): Promise<number> {
    return this.prisma.report.count({ where });
  }
}
