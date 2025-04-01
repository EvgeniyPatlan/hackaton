import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AnalyticsRepository {
  private readonly logger = new Logger(AnalyticsRepository.name);

  constructor(private prisma: PrismaService) {}

  // Generic method for creating analytics entries
  private async createAnalyticsEntry<T>(
    model: string, 
    data: any, 
    uniqueFields?: Record<string, any>
  ) {
    try {
      return await this.prisma[model].create({ data });
    } catch (error) {
      this.logger.error(`Error creating ${model} entry`, error);
      throw error;
    }
  }

  // Generic method for finding analytics entries
  private async findAnalyticsEntries<T>(
    model: string,
    params: {
      skip?: number;
      take?: number;
      cursor?: any;
      where?: any;
      orderBy?: any;
      select?: any;
    } = {}
  ) {
    try {
      return await this.prisma[model].findMany({
        skip: params.skip,
        take: params.take,
        cursor: params.cursor,
        where: params.where,
        orderBy: params.orderBy,
        select: params.select,
      });
    } catch (error) {
      this.logger.error(`Error finding ${model} entries`, error);
      throw error;
    }
  }

  // Analytics Events
  async createEvent(data: Prisma.AnalyticsEventCreateInput) {
    return this.createAnalyticsEntry('analyticsEvent', data);
  }

  async findEvents(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.AnalyticsEventWhereUniqueInput;
    where?: Prisma.AnalyticsEventWhereInput;
    orderBy?: Prisma.AnalyticsEventOrderByWithRelationInput;
  }) {
    return this.findAnalyticsEntries('analyticsEvent', params);
  }

  async countEvents(where: Prisma.AnalyticsEventWhereInput) {
    return this.prisma.analyticsEvent.count({ where });
  }

  async deleteEvents(where: Prisma.AnalyticsEventWhereInput) {
    return this.prisma.analyticsEvent.deleteMany({ where });
  }

  // Reports
  async createReport(data: Prisma.AnalyticsReportCreateInput) {
    return this.createAnalyticsEntry('analyticsReport', data);
  }

  async findReports(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.AnalyticsReportWhereUniqueInput;
    where?: Prisma.AnalyticsReportWhereInput;
    orderBy?: Prisma.AnalyticsReportOrderByWithRelationInput;
  }) {
    return this.findAnalyticsEntries('analyticsReport', params);
  }

  async findReportById(id: string) {
    return this.prisma.analyticsReport.findUnique({ where: { id } });
  }

  async updateReport(id: string, data: Prisma.AnalyticsReportUpdateInput) {
    return this.prisma.analyticsReport.update({ where: { id }, data });
  }

  async deleteReport(id: string) {
    return this.prisma.analyticsReport.delete({ where: { id } });
  }


  async findLocationAnalytics(params: {
    skip?: number;
    take?: number;
    where?: Prisma.LocationAnalyticsWhereInput;
    orderBy?: Prisma.LocationAnalyticsOrderByWithRelationInput;
  }) {
    return this.findAnalyticsEntries('locationAnalytics', params);
  }

// Location Analytics
async upsertLocationAnalytics(
  locationId: string,
  data: Prisma.LocationAnalyticsCreateInput | Prisma.LocationAnalyticsUpdateInput
) {
  try {
    return await this.prisma.locationAnalytics.upsert({
      where: { id: locationId }, // Изменено с locationId на id
      update: data,
      create: {
        ...(data as Prisma.LocationAnalyticsCreateInput),
        id: locationId, // Используем id вместо locationId
      },
    });
  } catch (error) {
    this.logger.error('Error upserting location analytics', error);
    throw error;
  }
}

  async getLocationAnalyticsById(locationId: string) {
    return this.prisma.locationAnalytics.findUnique({ 
      where: { id: locationId } // Изменено с locationId на id
    });
  }

  // User Analytics
  async upsertUserAnalytics(
    userId: string,
    data: Prisma.UserAnalyticsCreateInput | Prisma.UserAnalyticsUpdateInput
  ) {
    try {
      return await this.prisma.userAnalytics.upsert({
        where: { userId },
        update: data,
        create: {
          ...(data as Prisma.UserAnalyticsCreateInput),
          userId,
        },
      });
    } catch (error) {
      this.logger.error('Error upserting user analytics', error);
      throw error;
    }
  }

  async findUserAnalytics(params: {
    skip?: number;
    take?: number;
    where?: Prisma.UserAnalyticsWhereInput;
    orderBy?: Prisma.UserAnalyticsOrderByWithRelationInput;
  }) {
    return this.findAnalyticsEntries('userAnalytics', params);
  }

  async getUserAnalyticsById(userId: string) {
    return this.prisma.userAnalytics.findUnique({ 
      where: { userId } 
    });
  }

  // Geo Analytics
  async upsertGeoAnalytics(
    regionName: string,
    cityName: string | null,
    data: Prisma.GeoAnalyticsCreateInput | Prisma.GeoAnalyticsUpdateInput
  ) {
    try {
      return await this.prisma.geoAnalytics.upsert({
        where: {
          regionName_cityName: {
            regionName,
            cityName,
          },
        },
        update: data,
        create: {
          ...(data as Prisma.GeoAnalyticsCreateInput),
          regionName,
          cityName,
        },
      });
    } catch (error) {
      this.logger.error('Error upserting geo analytics', error);
      throw error;
    }
  }

  async findGeoAnalytics(params: {
    skip?: number;
    take?: number;
    where?: Prisma.GeoAnalyticsWhereInput;
    orderBy?: Prisma.GeoAnalyticsOrderByWithRelationInput;
  }) {
    return this.findAnalyticsEntries('geoAnalytics', params);
  }

  // Custom raw queries for complex analytics
  async executeRawQuery(query: string, parameters: any[] = []) {
    try {
      return await this.prisma.$queryRawUnsafe(query, ...parameters);
    } catch (error) {
      this.logger.error('Error executing raw query', error);
      throw error;
    }
  }
}