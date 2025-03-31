import { Injectable, Logger } from '@nestjs/common';
import { AnalyticsRepository } from '../analytics.repository';
import { RedisService } from '../../redis/redis.service';
import { CreateEventDto } from './dto/create-event.dto';
import { QueryEventsDto } from './dto/query-events.dto';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private readonly analyticsRepository: AnalyticsRepository,
    private readonly redisService: RedisService,
  ) {}

  async trackEvent(createEventDto: CreateEventDto) {
    try {
      // Зберігаємо подію в Redis для оперативного аналізу
      await this.redisService.storeEvent(createEventDto);

      // Зберігаємо подію в базі даних для довгострокового зберігання
      await this.analyticsRepository.createEvent({
        eventType: createEventDto.eventType,
        userId: createEventDto.userId,
        userRole: createEventDto.userRole,
        deviceType: createEventDto.deviceType,
        ipAddress: createEventDto.ipAddress,
        userAgent: createEventDto.userAgent,
        referrer: createEventDto.referrer,
        data: createEventDto.data as any,
      });

      // Оновлюємо лічильники в Redis
      await this.updateEventCounters(createEventDto);

      return { success: true, message: 'Event tracked successfully' };
    } catch (error) {
      this.logger.error(`Error tracking event: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async updateEventCounters(event: CreateEventDto) {
    // Оновлюємо загальний лічильник для типу події
    await this.redisService.incrementCounter(`event:${event.eventType}`);

    if (event.userId) {
      // Оновлюємо лічильник для конкретного користувача
      await this.redisService.incrementCounter(`user:${event.userId}:${event.eventType}`);
    }

    // Оновлюємо лічильники для специфічних подій
    switch (event.eventType) {
      case 'pageView':
        const page = event.data?.page;
        if (page) {
          await this.redisService.incrementCounter(`pageview:${page}`);
        }
        break;
      case 'locationView':
        const locationId = event.data?.locationId;
        if (locationId) {
          await this.redisService.incrementCounter(`location:${locationId}:views`);
        }
        break;
      case 'search':
        await this.redisService.incrementCounter('searches');
        const query = event.data?.query;
        if (query) {
          await this.redisService.incrementCounter(`search:${query}`);
        }
        break;
    }
  }

  async getEvents(queryDto: QueryEventsDto) {
    try {
      const { skip, take, orderBy, startDate, endDate, eventType, userId } = queryDto;

      const where: any = {};

      // Фільтрація за часовим проміжком
      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) {
          where.timestamp.gte = new Date(startDate);
        }
        if (endDate) {
          where.timestamp.lte = new Date(endDate);
        }
      }

      // Фільтрація за типом події
      if (eventType) {
        where.eventType = eventType;
      }

      // Фільтрація за користувачем
      if (userId) {
        where.userId = userId;
      }

      const events = await this.analyticsRepository.findEvents({
        skip,
        take,
        where,
        orderBy: orderBy ? { [orderBy]: 'desc' } : { timestamp: 'desc' },
      });

      const total = await this.analyticsRepository.countEvents(where);

      return {
        data: events,
        meta: {
          total,
          skip,
          take,
        },
      };
    } catch (error) {
      this.logger.error(`Error getting events: ${error.message}`, error.stack);
      throw error;
    }
  }

  async cleanupOldEvents(olderThan: Date) {
    try {
      const deletedCount = await this.analyticsRepository.deleteEvents({
        timestamp: {
          lt: olderThan,
        },
      });

      this.logger.log(`Deleted ${deletedCount} events older than ${olderThan.toISOString()}`);
      return { deletedCount };
    } catch (error) {
      this.logger.error(`Error cleaning up old events: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getEventStatistics(eventType: string, startDate: Date, endDate: Date) {
    try {
      const where = {
        eventType,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      };

      const total = await this.analyticsRepository.countEvents(where);

      // Групування за днями
      const dailyStats = await this.analyticsRepository.executeRawQuery(`
        SELECT 
          DATE_TRUNC('day', "timestamp") as day,
          COUNT(*) as count
        FROM "AnalyticsEvent"
        WHERE "eventType" = $1
          AND "timestamp" >= $2
          AND "timestamp" <= $3
        GROUP BY day
        ORDER BY day ASC
      `, [eventType, startDate, endDate]);

      return {
        total,
        dailyStats,
      };
    } catch (error) {
      this.logger.error(`Error getting event statistics: ${error.message}`, error.stack);
      throw error;
    }
  }
}
