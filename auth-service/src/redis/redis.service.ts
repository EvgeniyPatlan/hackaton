import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private redisClient: Redis;
  private redisSubscriber: Redis;

  constructor(private configService: ConfigService) {
    const redisHost = this.configService.get<string>('REDIS_HOST', 'redis');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);

    this.redisClient = new Redis({
      host: redisHost,
      port: redisPort,
      lazyConnect: true,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    // Окремий клієнт для підписок, щоб не блокувати основного клієнта
    this.redisSubscriber = new Redis({
      host: redisHost,
      port: redisPort,
      lazyConnect: true,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });
  }

  async onModuleInit() {
    await this.redisClient.connect();
    await this.redisSubscriber.connect();
    this.logger.log('Successfully connected to Redis');

    // Обробник помилок
    this.redisClient.on('error', (err: Error) => {
      this.logger.error(`Redis client error: ${err.message}`);
    });

    this.redisSubscriber.on('error', (err: Error) => {
      this.logger.error(`Redis subscriber error: ${err.message}`);
    });
  }

  async onModuleDestroy() {
    await this.redisClient.quit();
    await this.redisSubscriber.quit();
    this.logger.log('Successfully disconnected from Redis');
  }

  getClient(): Redis {
    return this.redisClient;
  }

  getSubscriber(): Redis {
    return this.redisSubscriber;
  }

  // Сервісні методи для роботи з Redis

  async set(key: string, value: string, expireSeconds?: number): Promise<void> {
    if (expireSeconds) {
      await this.redisClient.set(key, value, 'EX', expireSeconds);
    } else {
      await this.redisClient.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async subscribe(channel: string, callback: (channel: string, message: string) => void): Promise<void> {
    await this.redisSubscriber.subscribe(channel);
    this.redisSubscriber.on('message', callback);
  }

  async publish(channel: string, message: string): Promise<number> {
    return this.redisClient.publish(channel, message);
  }

  async unsubscribe(channel: string): Promise<void> {
    await this.redisSubscriber.unsubscribe(channel);
  }
}