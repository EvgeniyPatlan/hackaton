import { Injectable, Logger } from '@nestjs/common';
import { AnalyticsRepository } from '../analytics.repository';
import { RedisService } from '../../redis/redis.service';

// Додаємо інтерфейс для типізації результату SQL запиту
interface WeeklyStats {
  locationId: string;
  weeklyViews: number;
}

@Injectable()
export class LocationAnalyticsService {
  private readonly logger = new Logger(LocationAnalyticsService.name);

  constructor(
    private readonly analyticsRepository: AnalyticsRepository,
    private readonly redisService: RedisService,
  ) {}

  async updateDailyMetrics() {
    try {
      // Отримуємо всі ключі з Redis, що відповідають переглядам локацій
      const locationViewKeys = await this.redisService.getClient().keys('location:*:views');
      
      for (const key of locationViewKeys) {
        const locationId = key.split(':')[1];
        const viewCount = parseInt(await this.redisService.get(key) || '0', 10);
        
        if (viewCount > 0) {
          // Оновлюємо статистику в БД
          await this.analyticsRepository.upsertLocationAnalytics(locationId, {
            viewCount: { increment: viewCount },
            lastViewed: new Date(),
          });
          
          // Скидаємо лічильник після оновлення
          await this.redisService.set(key, '0');
        }
      }
      
      // Оновлюємо популярність локацій
      await this.updateLocationPopularity();
      
      this.logger.log('Daily location metrics updated successfully');
    } catch (error) {
      this.logger.error(`Error updating daily location metrics: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateLocationPopularity() {
    try {
      // Формула популярності:
      // popularity = (viewCount * 0.5) + (reviewCount * 0.3) + (avgRating * 10 * 0.2)
      const result = await this.analyticsRepository.executeRawQuery(`
        UPDATE "LocationAnalytics"
        SET "popularityScore" = ("viewCount" * 0.5) + ("reviewCount" * 0.3) + (COALESCE("avgRating", 0) * 10 * 0.2)
      `);
      
      this.logger.log('Location popularity scores updated');
      return result;
    } catch (error) {
      this.logger.error(`Error updating location popularity: ${error.message}`, error.stack);
      throw error;
    }
  }

  async calculateWeeklyPopularityScores() {
    try {
      // Отримуємо статистику за останній тиждень
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      // Отримуємо дані про перегляди, відгуки та рейтинги з відповідних сервісів
      const weeklyStats = await this.analyticsRepository.executeRawQuery(`
        SELECT 
          "locationId",
          COUNT(*) as "weeklyViews"
        FROM "AnalyticsEvent"
        WHERE "eventType" = 'locationView'
          AND "timestamp" >= $1
        GROUP BY "locationId"
      `, [oneWeekAgo]);
      
      // Оновлюємо рейтинг популярності для кожної локації
      // Явно типізуємо результат SQL запиту як масив WeeklyStats
      for (const stat of weeklyStats as WeeklyStats[]) {
        const { locationId, weeklyViews } = stat;
        
        // Отримуємо поточну інформацію про локацію
        const locationAnalytics = await this.analyticsRepository.getLocationAnalyticsById(locationId);
        
        if (locationAnalytics) {
          // Оновлюємо рейтинг популярності з урахуванням даних за тиждень
          const newPopularityScore = 
            (locationAnalytics.viewCount * 0.3) + 
            (weeklyViews * 0.3) + 
            (locationAnalytics.reviewCount * 0.2) + 
            ((locationAnalytics.avgRating || 0) * 10 * 0.2);
          
          await this.analyticsRepository.upsertLocationAnalytics(locationId, {
            popularityScore: newPopularityScore,
          });
        }
      }
      
      this.logger.log('Weekly popularity scores calculated successfully');
    } catch (error) {
      this.logger.error(`Error calculating weekly popularity scores: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getTopLocations(limit: number = 10) {
    try {
      return this.analyticsRepository.findLocationAnalytics({
        take: limit,
        orderBy: { popularityScore: 'desc' },
      });
    } catch (error) {
      this.logger.error(`Error getting top locations: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getLocationAnalytics(locationId: string) {
    try {
      return this.analyticsRepository.getLocationAnalyticsById(locationId);
    } catch (error) {
      this.logger.error(`Error getting location analytics: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getTotalLocations() {
    try {
      const result = await this.analyticsRepository.executeRawQuery(`
        SELECT COUNT(DISTINCT "locationId") as total FROM "LocationAnalytics"
      `);
      return result[0]?.total || 0;
    } catch (error) {
      this.logger.error(`Error getting total locations: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateLocationStats(locationId: string, data: {
    viewCount?: number;
    reviewCount?: number;
    avgRating?: number;
  }) {
    try {
      await this.analyticsRepository.upsertLocationAnalytics(locationId, {
        ...(data.viewCount !== undefined && { viewCount: { increment: data.viewCount } }),
        ...(data.reviewCount !== undefined && { reviewCount: { increment: data.reviewCount } }),
        ...(data.avgRating !== undefined && { avgRating: data.avgRating }),
        lastViewed: data.viewCount ? new Date() : undefined,
      });
      
      // Переобчислюємо популярність локації
      await this.updateLocationPopularity();
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error updating location stats: ${error.message}`, error.stack);
      throw error;
    }
  }
}