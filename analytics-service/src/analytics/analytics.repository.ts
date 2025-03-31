import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AnalyticsRepository {
  constructor(private prisma: PrismaService) {}

  // Analytics Events
  async createEvent(data: Prisma.AnalyticsEventCreateInput) {
    return this.prisma.analyticsEvent.create({
      data,
    });
  }

  async findEvents(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.AnalyticsEventWhereUniqueInput;
    where?: Prisma.AnalyticsEventWhereInput;
    orderBy?: Prisma.AnalyticsEventOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.analyticsEvent.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async countEvents(where: Prisma.AnalyticsEventWhereInput) {
    return this.prisma.analyticsEvent.count({
      where,
    });
  }

  async deleteEvents(where: Prisma.AnalyticsEventWhereInput) {
    return this.prisma.analyticsEvent.deleteMany({
      where,
    });
  }

  // Reports
  async createReport(data: Prisma.AnalyticsReportCreateInput) {
    return this.prisma.analyticsReport.create({
      data,
    });
  }

  async findReports(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.AnalyticsReportWhereUniqueInput;
    where?: Prisma.AnalyticsReportWhereInput;
    orderBy?: Prisma.AnalyticsReportOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.analyticsReport.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async findReportById(id: string) {
    return this.prisma.analyticsReport.findUnique({
      where: { id },
    });
  }

  async updateReport(id: string, data: Prisma.AnalyticsReportUpdateInput) {
    return this.prisma.analyticsReport.update({
      where: { id },
      data,
    });
  }

  async deleteReport(id: string) {
    return this.prisma.analyticsReport.delete({
      where: { id },
    });
  }

  // Dashboards
  async createDashboard(data: Prisma.DashboardCreateInput) {
    return this.prisma.dashboard.create({
      data,
    });
  }

  async findDashboards(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.DashboardWhereUniqueInput;
    where?: Prisma.DashboardWhereInput;
    orderBy?: Prisma.DashboardOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.dashboard.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async findDashboardById(id: string) {
    return this.prisma.dashboard.findUnique({
      where: { id },
    });
  }

  async updateDashboard(id: string, data: Prisma.DashboardUpdateInput) {
    return this.prisma.dashboard.update({
      where: { id },
      data,
    });
  }

  async deleteDashboard(id: string) {
    return this.prisma.dashboard.delete({
      where: { id },
    });
  }

  // Location Analytics
  async upsertLocationAnalytics(
    locationId: string,
    data: Prisma.LocationAnalyticsCreateInput | Prisma.LocationAnalyticsUpdateInput,
  ) {
    return this.prisma.locationAnalytics.upsert({
      where: { locationId },
      update: data,
      create: {
        ...(data as Prisma.LocationAnalyticsCreateInput),
        locationId,
      },
    });
  }

  async findLocationAnalytics(params: {
    skip?: number;
    take?: number;
    where?: Prisma.LocationAnalyticsWhereInput;
    orderBy?: Prisma.LocationAnalyticsOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return this.prisma.locationAnalytics.findMany({
      skip,
      take,
      where,
      orderBy,
    });
  }

  async getLocationAnalyticsById(locationId: string) {
    return this.prisma.locationAnalytics.findUnique({
      where: { locationId },
    });
  }

  // User Analytics
  async upsertUserAnalytics(
    userId: string,
    data: Prisma.UserAnalyticsCreateInput | Prisma.UserAnalyticsUpdateInput,
  ) {
    return this.prisma.userAnalytics.upsert({
      where: { userId },
      update: data,
      create: {
        ...(data as Prisma.UserAnalyticsCreateInput),
        userId,
      },
    });
  }

  async findUserAnalytics(params: {
    skip?: number;
    take?: number;
    where?: Prisma.UserAnalyticsWhereInput;
    orderBy?: Prisma.UserAnalyticsOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return this.prisma.userAnalytics.findMany({
      skip,
      take,
      where,
      orderBy,
    });
  }

  async getUserAnalyticsById(userId: string) {
    return this.prisma.userAnalytics.findUnique({
      where: { userId },
    });
  }

  // Geo Analytics
  async upsertGeoAnalytics(
    regionName: string,
    cityName: string | null,
    data: Prisma.GeoAnalyticsCreateInput | Prisma.GeoAnalyticsUpdateInput,
  ) {
    return this.prisma.geoAnalytics.upsert({
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
  }

  async findGeoAnalytics(params: {
    skip?: number;
    take?: number;
    where?: Prisma.GeoAnalyticsWhereInput;
    orderBy?: Prisma.GeoAnalyticsOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return this.prisma.geoAnalytics.findMany({
      skip,
      take,
      where,
      orderBy,
    });
  }

  // Custom raw queries for complex analytics
  async executeRawQuery(query: string, parameters: any[] = []) {
    return this.prisma.$queryRawUnsafe(query, ...parameters);
  }
}
