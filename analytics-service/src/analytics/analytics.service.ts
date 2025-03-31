import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { AnalyticsRepository } from './analytics.repository';
import { RedisService } from '../redis/redis.service';
import { EventsService } from './events/events.service';
import { ReportsService } from './reports/reports.service';
import { LocationAnalyticsService } from './location-analytics/location-analytics.service';
import { UserAnalyticsService } from './user-analytics/user-analytics.service';
import { GeoAnalyticsService } from './geo-analytics/geo-analytics.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private readonly analyticsRepository: AnalyticsRepository,
    private readonly redisService: RedisService,
    private readonly eventsService: EventsService,
    private readonly reportsService: ReportsService,
    private readonly locationAnalyticsService: LocationAnalyticsService,
    private readonly userAnalyticsService: UserAnalyticsService,
    private readonly geoAnalyticsService: GeoAnalyticsService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {
    this.setupScheduledJobs();
  }

  private setupScheduledJobs() {
    // Щоденний аналіз та агрегація даних о 3:00 ночі
    const dailyJob = new CronJob('0 3 * * *', () => {
      this.logger.log('Running daily analytics job');
      this.aggregateDailyMetrics();
    });

    // Щотижневий аналіз даних та генерація звітів у неділю о 4:00 ночі
    const weeklyJob = new CronJob('0 4 * * 0', () => {
      this.logger.log('Running weekly analytics job');
      this.generateWeeklyReports();
    });

    // Щомісячний аналіз даних 1-го числа о 5:00 ночі
    const monthlyJob = new CronJob('0 5 1 * *', () => {
      this.logger.log('Running monthly analytics job');
      this.generateMonthlyReports();
    });

    // Реєстрація задач в планувальнику
    this.schedulerRegistry.addCronJob('dailyAnalytics', dailyJob);
    this.schedulerRegistry.addCronJob('weeklyAnalytics', weeklyJob);
    this.schedulerRegistry.addCronJob('monthlyAnalytics', monthlyJob);

    // Запуск задач
    dailyJob.start();
    weeklyJob.start();
    monthlyJob.start();

    this.logger.log('Scheduled analytics jobs have been set up');
  }

  async aggregateDailyMetrics() {
    try {
      // Збір та агрегація даних за добу
      await this.locationAnalyticsService.updateDailyMetrics();
      await this.userAnalyticsService.updateDailyMetrics();
      await this.geoAnalyticsService.updateGeoStatistics();

      // Очищення старих даних подій
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      await this.eventsService.cleanupOldEvents(oneMonthAgo);

      this.logger.log('Daily metrics aggregation completed successfully');
    } catch (error) {
      this.logger.error(`Error in daily metrics aggregation: ${error.message}`, error.stack);
    }
  }

  async generateWeeklyReports() {
    try {
      // Генерація щотижневих звітів
      await this.reportsService.generateScheduledReports('weekly');
      
      // Аналіз популярності локацій за тиждень
      await this.locationAnalyticsService.calculateWeeklyPopularityScores();
      
      this.logger.log('Weekly reports generation completed successfully');
    } catch (error) {
      this.logger.error(`Error in weekly reports generation: ${error.message}`, error.stack);
    }
  }

  async generateMonthlyReports() {
    try {
      // Генерація щомісячних звітів
      await this.reportsService.generateScheduledReports('monthly');
      
      // Аналіз активності користувачів за місяць
      await this.userAnalyticsService.analyzeMonthlyUserActivity();
      
      // Аналіз регіональних трендів
      await this.geoAnalyticsService.analyzeRegionalTrends();
      
      this.logger.log('Monthly reports generation completed successfully');
    } catch (error) {
      this.logger.error(`Error in monthly reports generation: ${error.message}`, error.stack);
    }
  }

  // Методи для моніторингу системи

  async getSystemOverview() {
    try {
      const totalUsers = await this.userAnalyticsService.getTotalUsers();
      const totalLocations = await this.locationAnalyticsService.getTotalLocations();
      const activeUsersLast7Days = await this.userAnalyticsService.getActiveUsersCount(7);
      const popularRegions = await this.geoAnalyticsService.getTopRegions(5);
      
      return {
        totalUsers,
        totalLocations,
        activeUsersLast7Days,
        popularRegions,
        systemStatus: 'healthy',
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Error getting system overview: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getRealtimeMetrics() {
    try {
      const activeUsers = await this.redisService.getCounter('online_users');
      const requestsPerMinute = await this.redisService.getCounter('requests_per_minute');
      const searchesInProgress = await this.redisService.getCounter('searches_in_progress');
      
      return {
        activeUsers,
        requestsPerMinute,
        searchesInProgress,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Error getting realtime metrics: ${error.message}`, error.stack);
      throw error;
    }
  }
}
