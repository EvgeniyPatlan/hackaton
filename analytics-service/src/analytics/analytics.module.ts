import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { EventsController } from './events/events.controller';
import { ReportsController } from './reports/reports.controller';
import { DashboardsController } from './dashboards/dashboards.controller';
import { MetricsController } from './metrics/metrics.controller';
import { AnalyticsService } from './analytics.service';
import { EventsService } from './events/events.service';
import { ReportsService } from './reports/reports.service';
import { DashboardsService } from './dashboards/dashboards.service';
import { LocationAnalyticsService } from './location-analytics/location-analytics.service';
import { UserAnalyticsService } from './user-analytics/user-analytics.service';
import { GeoAnalyticsService } from './geo-analytics/geo-analytics.service';
import { AnalyticsRepository } from './analytics.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { LocationAnalyticsController } from './location-analytics/location-analytics.controller';
import { UserAnalyticsController } from './user-analytics/user-analytics.controller';
import { GeoAnalyticsController } from './geo-analytics/geo-analytics.controller';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [
    AnalyticsController,
    EventsController,
    ReportsController,
    DashboardsController,
    MetricsController,
    LocationAnalyticsController,
    UserAnalyticsController,
    GeoAnalyticsController,
  ],
  providers: [
    AnalyticsService,
    EventsService,
    ReportsService,
    DashboardsService,
    LocationAnalyticsService,
    UserAnalyticsService,
    GeoAnalyticsService,
    AnalyticsRepository,
  ],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
