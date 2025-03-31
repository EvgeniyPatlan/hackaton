import { Injectable, Logger } from '@nestjs/common';
import { AnalyticsRepository } from '../analytics.repository';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class GeoAnalyticsService {
  private readonly logger = new Logger(GeoAnalyticsService.name);

  constructor(
    private readonly analyticsRepository: AnalyticsRepository,
    private readonly redisService: RedisService,
  ) {}

  async updateGeoStatistics() {
    try {
      // Отримуємо статистику по регіонах та містах з бази даних
      // Для цього потрібно з'єднатися з базою даних локацій
      const regionStats = await this.analyticsRepository.executeRawQuery(`
        WITH region_stats AS (
          SELECT 
            l."regionName",
            l."cityName",
            COUNT(*) as location_count,
            SUM(CASE WHEN l."accessibilityLevel" = 'ACCESSIBLE' THEN 1 ELSE 0 END) as accessible_count,
            SUM(CASE WHEN l."accessibilityLevel" = 'INACCESSIBLE' THEN 1 ELSE 0 END) as inaccessible_count,
            SUM(CASE WHEN l."accessibilityLevel" = 'PARTIALLY_ACCESSIBLE' THEN 1 ELSE 0 END) as partially_accessible_count
          FROM 
            "Location" l
          GROUP BY 
            l."regionName", l."cityName"
        ),
        category_popularity AS (
          SELECT 
            l."regionName",
            l."cityName",
            l."category",
            COUNT(*) as category_count,
            ROW_NUMBER() OVER (PARTITION BY l."regionName", l."cityName" ORDER BY COUNT(*) DESC) as rank
          FROM 
            "Location" l
          GROUP BY 
            l."regionName", l."cityName", l."category"
        )
        SELECT 
          rs."regionName",
          rs."cityName",
          rs.location_count,
          rs.accessible_count,
          rs.inaccessible_count,
          rs.partially_accessible_count,
          cp."category" as popular_category
        FROM 
          region_stats rs
        LEFT JOIN 
          category_popularity cp ON rs."regionName" = cp."regionName" 
            AND (rs."cityName" = cp."cityName" OR (rs."cityName" IS NULL AND cp."cityName" IS NULL))
            AND cp.rank = 1
      `);

      // Оновлюємо дані в таблиці GeoAnalytics
      for (const stat of regionStats) {
        await this.analyticsRepository.upsertGeoAnalytics(
          stat.regionName,
          stat.cityName,
          {
            locationCount: stat.location_count,
            accessibleCount: stat.accessible_count,
            inaccessibleCount: stat.inaccessible_count,
            partiallyAccessibleCount: stat.partially_accessible_count,
            popularCategory: stat.popular_category,
          },
        );
      }

      this.logger.log('Geo statistics updated successfully');
    } catch (error) {
      this.logger.error(`Error updating geo statistics: ${error.message}`, error.stack);
      throw error;
    }
  }

  async analyzeRegionalTrends() {
    try {
      // Аналіз трендів по регіонах за останній місяць
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      // Отримуємо дані про активність користувачів по регіонах
      const regionActivity = await this.analyticsRepository.executeRawQuery(`
        SELECT 
          l."regionName",
          COUNT(DISTINCT ae."userId") as unique_users,
          COUNT(*) as total_views
        FROM 
          "AnalyticsEvent" ae
        JOIN 
          "Location" l ON ae.data->>'locationId' = l."id"::text
        WHERE 
          ae."eventType" = 'locationView'
          AND ae."timestamp" >= $1
        GROUP BY 
          l."regionName"
        ORDER BY 
          total_views DESC
      `, [oneMonthAgo]);

      // Зберігаємо результати в Redis для швидкого доступу
      await this.redisService.set(
        'analytics:regional:trends',
        JSON.stringify(regionActivity),
        60 * 60 * 24 * 7 // зберігаємо на тиждень
      );

      this.logger.log('Regional trends analysis completed');
      return regionActivity;
    } catch (error) {
      this.logger.error(`Error analyzing regional trends: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getTopRegions(limit: number = 5) {
    try {
      return this.analyticsRepository.findGeoAnalytics({
        where: {
          cityName: null, // Тільки регіони, без міст
        },
        orderBy: { locationCount: 'desc' },
        take: limit,
      });
    } catch (error) {
      this.logger.error(`Error getting top regions: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getTopCities(limit: number = 5) {
    try {
      return this.analyticsRepository.findGeoAnalytics({
        where: {
          cityName: {
            not: null, // Тільки міста
          },
        },
        orderBy: { locationCount: 'desc' },
        take: limit,
      });
    } catch (error) {
      this.logger.error(`Error getting top cities: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getRegionStatistics(regionName: string) {
    try {
      const regionStats = await this.analyticsRepository.findGeoAnalytics({
        where: {
          regionName,
          cityName: null,
        },
      });

      const citiesStats = await this.analyticsRepository.findGeoAnalytics({
        where: {
          regionName,
          cityName: {
            not: null,
          },
        },
      });

      return {
        region: regionStats[0] || null,
        cities: citiesStats,
      };
    } catch (error) {
      this.logger.error(`Error getting region statistics: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getAccessibilityStatsByRegion() {
    try {
      // Отримуємо статистику доступності по регіонах
      const regionsData = await this.analyticsRepository.findGeoAnalytics({
        where: {
          cityName: null, // Тільки регіони
        },
      });

      // Підготовка даних для відображення
      const result = regionsData.map(region => ({
        regionName: region.regionName,
        totalLocations: region.locationCount,
        accessiblePercentage: region.locationCount > 0 
          ? Math.round((region.accessibleCount / region.locationCount) * 100) 
          : 0,
        inaccessiblePercentage: region.locationCount > 0 
          ? Math.round((region.inaccessibleCount / region.locationCount) * 100) 
          : 0,
        partiallyAccessiblePercentage: region.locationCount > 0 
          ? Math.round((region.partiallyAccessibleCount / region.locationCount) * 100) 
          : 0,
        popularCategory: region.popularCategory,
      }));

      return result;
    } catch (error) {
      this.logger.error(`Error getting accessibility statistics by region: ${error.message}`, error.stack);
      throw error;
    }
  }
}
