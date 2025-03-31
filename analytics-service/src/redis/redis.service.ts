import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.redisClient = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: parseInt(this.configService.get('REDIS_PORT', '6379')),
      password: this.configService.get('REDIS_PASSWORD', ''),
      keyPrefix: 'analytics:',
      db: parseInt(this.configService.get('REDIS_DB', '0')),
      retryStrategy: (times) => {
        // Стратегія повторного підключення: 1s, 2s, 3s, etc.
        const delay = Math.min(times * 1000, 10000);
        return delay;
      },
    });

    this.redisClient.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    this.redisClient.on('connect', () => {
      console.log('Successfully connected to Redis');
    });
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }

  // Базові методи для роботи з Redis

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<'OK'> {
    if (ttl) {
      return this.redisClient.set(key, value, 'EX', ttl);
    }
    return this.redisClient.set(key, value);
  }

  async del(key: string): Promise<number> {
    return this.redisClient.del(key);
  }

  async incr(key: string): Promise<number> {
    return this.redisClient.incr(key);
  }

  async incrBy(key: string, increment: number): Promise<number> {
    return this.redisClient.incrby(key, increment);
  }

  // Методи для статистики

  async incrementCounter(metric: string, value: number = 1): Promise<number> {
    const key = `counter:${metric}`;
    return this.incrBy(key, value);
  }

  async getCounter(metric: string): Promise<number> {
    const key = `counter:${metric}`;
    const value = await this.get(key);
    return parseInt(value || '0', 10);
  }

  async storeEvent(event: any): Promise<void> {
    const key = `events:${new Date().toISOString().split('T')[0]}`;
    await this.redisClient.lpush(key, JSON.stringify(event));
    // Обмежуємо кількість подій для економії пам'яті
    await this.redisClient.ltrim(key, 0, 9999);
    // Встановлюємо TTL для автоматичного очищення старих даних після 7 днів
    await this.redisClient.expire(key, 60 * 60 * 24 * 7);
  }

  async getRecentEvents(count: number = 100): Promise<any[]> {
    const key = `events:${new Date().toISOString().split('T')[0]}`;
    const events = await this.redisClient.lrange(key, 0, count - 1);
    return events.map(event => JSON.parse(event));
  }

  // Метод для отримання клієнта Redis (для додаткових операцій)
  getClient(): Redis {
    return this.redisClient;
  }
}
