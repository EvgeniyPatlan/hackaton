import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;
  private readonly logger = new Logger(RedisService.name);
  private readonly prefix = 'user-service:';

  constructor(private configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    this.redisClient = new Redis(redisUrl);
  }

  async onModuleInit() {
    try {
      await this.redisClient.ping();
      this.logger.log('Successfully connected to Redis');
    } catch (e) {
      this.logger.error('Failed to connect to Redis', e);
      throw e;
    }
  }

  async onModuleDestroy() {
    await this.redisClient.quit();
    this.logger.log('Redis connection closed');
  }

  getClient(): Redis {
    return this.redisClient;
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(`${this.prefix}${key}`);
  }

  async set(
    key: string,
    value: string,
    expireSeconds?: number,
  ): Promise<string> {
    if (expireSeconds) {
      return this.redisClient.set(
        `${this.prefix}${key}`,
        value,
        'EX',
        expireSeconds,
      );
    }
    return this.redisClient.set(`${this.prefix}${key}`, value);
  }

  async del(key: string): Promise<number> {
    return this.redisClient.del(`${this.prefix}${key}`);
  }

  async exists(key: string): Promise<number> {
    return this.redisClient.exists(`${this.prefix}${key}`);
  }

  async setObject(
    key: string,
    value: Record<string, any>,
    expireSeconds?: number,
  ): Promise<string> {
    return this.set(key, JSON.stringify(value), expireSeconds);
  }

  async getObject<T>(key: string): Promise<T | null> {
    const data = await this.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch (e) {
      this.logger.error(`Failed to parse Redis data for key ${key}`, e);
      return null;
    }
  }

  // Cache decorator method
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    expireSeconds?: number,
  ): Promise<T> {
    const cached = await this.getObject<T>(key);
    if (cached) {
      return cached;
    }

    const result = await factory();
    await this.setObject(key, result, expireSeconds);
    return result;
  }

  // Invalidate cache by prefix
  async invalidateByPrefix(prefix: string): Promise<void> {
    const fullPrefix = `${this.prefix}${prefix}`;
    const keys = await this.redisClient.keys(`${fullPrefix}*`);
    if (keys.length > 0) {
      await this.redisClient.del(...keys);
      this.logger.debug(`Invalidated ${keys.length} keys with prefix ${prefix}`);
    }
  }
}
