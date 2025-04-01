import { Injectable, Logger } from '@nestjs/common';
import { AnalyticsRepository } from '../analytics.repository';
import { RedisService } from '../../redis/redis.service';

// Інтерфейси для типізації
interface UserDailyStats {
  sessionCount: number;
  timeSpent: number;
  lastActivity: string | null;
  locationsAdded: number;
  reviewsSubmitted: number;
  searchesPerformed: number;
}

interface ActiveUserStat {
  userId: string;
  eventCount: number;
}

@Injectable()
export class UserAnalyticsService {
  private readonly logger = new Logger(UserAnalyticsService.name);

  constructor(
    private readonly analyticsRepository: AnalyticsRepository,
    private readonly redisService: RedisService,
  ) {}

  async updateDailyMetrics() {
    try {
      // Отримуємо статистику користувачів за день
      const userStats = await this.getUserDailyStats();
      
      // Оновлюємо статистику в базі даних
      for (const [userId, stats] of Object.entries(userStats)) {
        await this.analyticsRepository.upsertUserAnalytics(userId, {
          sessionCount: { increment: stats.sessionCount || 0 },
          totalTimeSpent: { increment: stats.timeSpent || 0 },
          lastActivity: stats.lastActivity ? new Date(stats.lastActivity) : undefined,
          locationsAdded: { increment: stats.locationsAdded || 0 },
          reviewsSubmitted: { increment: stats.reviewsSubmitted || 0 },
          searchesPerformed: { increment: stats.searchesPerformed || 0 },
        });
      }
      
      // Скидаємо щоденні лічильники в Redis
      await this.resetDailyCounters();
      
      this.logger.log('Daily user metrics updated successfully');
    } catch (error) {
      this.logger.error(`Error updating daily user metrics: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async getUserDailyStats(): Promise<Record<string, UserDailyStats>> {
    // Отримуємо ключі для всіх користувачів
    const userKeys = await this.redisService.getClient().keys('user:*');
    const userStats: Record<string, UserDailyStats> = {};
    
    for (const key of userKeys) {
      const parts = key.split(':');
      if (parts.length >= 2) {
        const userId = parts[1];
        const eventType = parts.length >= 3 ? parts[2] : null;
        
        if (!userStats[userId]) {
          userStats[userId] = {
            sessionCount: 0,
            timeSpent: 0,
            lastActivity: null,
            locationsAdded: 0,
            reviewsSubmitted: 0,
            searchesPerformed: 0,
          };
        }
        
        // Отримуємо значення лічильника
        const value = parseInt(await this.redisService.get(key) || '0', 10);
        
        // Оновлюємо відповідне поле в статистиці
        if (eventType === 'session') {
          userStats[userId].sessionCount += value;
        } else if (eventType === 'timeSpent') {
          userStats[userId].timeSpent += value;
        } else if (eventType === 'lastActivity') {
          userStats[userId].lastActivity = await this.redisService.get(key);
        } else if (eventType === 'locationAdd') {
          userStats[userId].locationsAdded += value;
        } else if (eventType === 'reviewSubmit') {
          userStats[userId].reviewsSubmitted += value;
        } else if (eventType === 'search') {
          userStats[userId].searchesPerformed += value;
        }
      }
    }
    
    return userStats;
  }

  private async resetDailyCounters() {
    // Отримуємо ключі для всіх щоденних лічильників
    const dailyKeys = await this.redisService.getClient().keys('daily:*');
    
    // Видаляємо всі лічильники
    if (dailyKeys.length > 0) {
      await this.redisService.getClient().del(...dailyKeys);
    }
  }

  async analyzeMonthlyUserActivity() {
    try {
      // Аналіз активності користувачів за місяць
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      // Отримуємо активних користувачів за місяць
      const activeUsers = await this.analyticsRepository.executeRawQuery(`
        SELECT "userId", COUNT(*) as "eventCount"
        FROM "AnalyticsEvent"
        WHERE "timestamp" >= $1 AND "userId" IS NOT NULL
        GROUP BY "userId"
        ORDER BY "eventCount" DESC
      `, [oneMonthAgo]) as ActiveUserStat[];
      
      // Зберігаємо кешовані результати аналізу в Redis
      await this.redisService.set(
        'analytics:monthly:active_users', 
        JSON.stringify(activeUsers.slice(0, 100)),
        60 * 60 * 24 * 7 // зберігаємо на тиждень
      );
      
      this.logger.log('Monthly user activity analysis completed');
      return activeUsers;
    } catch (error) {
      this.logger.error(`Error analyzing monthly user activity: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getMostActiveUsers(limit: number = 10) {
    try {
      return this.analyticsRepository.findUserAnalytics({
        take: limit,
        orderBy: { sessionCount: 'desc' },
      });
    } catch (error) {
      this.logger.error(`Error getting most active users: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getUserAnalytics(userId: string) {
    try {
      return this.analyticsRepository.getUserAnalyticsById(userId);
    } catch (error) {
      this.logger.error(`Error getting user analytics: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getActiveUsersCount(days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const result = await this.analyticsRepository.executeRawQuery(`
        SELECT COUNT(DISTINCT "userId") as count
        FROM "AnalyticsEvent"
        WHERE "timestamp" >= $1 AND "userId" IS NOT NULL
      `, [startDate]) as { count: number }[];
      
      return result[0]?.count || 0;
    } catch (error) {
      this.logger.error(`Error getting active users count: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getTotalUsers() {
    try {
      const result = await this.analyticsRepository.executeRawQuery(`
        SELECT COUNT(DISTINCT "userId") as total FROM "UserAnalytics"
      `) as { total: number }[];
      return result[0]?.total || 0;
    } catch (error) {
      this.logger.error(`Error getting total users: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateUserStats(userId: string, data: {
    sessionCount?: number;
    timeSpent?: number;
    locationsAdded?: number;
    reviewsSubmitted?: number;
    searchesPerformed?: number;
  }) {
    try {
      await this.analyticsRepository.upsertUserAnalytics(userId, {
        ...(data.sessionCount !== undefined && { sessionCount: { increment: data.sessionCount } }),
        ...(data.timeSpent !== undefined && { totalTimeSpent: { increment: data.timeSpent } }),
        ...(data.locationsAdded !== undefined && { locationsAdded: { increment: data.locationsAdded } }),
        ...(data.reviewsSubmitted !== undefined && { reviewsSubmitted: { increment: data.reviewsSubmitted } }),
        ...(data.searchesPerformed !== undefined && { searchesPerformed: { increment: data.searchesPerformed } }),
        lastActivity: new Date(),
      });
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error updating user stats: ${error.message}`, error.stack);
      throw error;
    }
  }
}