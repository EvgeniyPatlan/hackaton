import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
export declare class RedisService implements OnModuleInit, OnModuleDestroy {
    private configService;
    private readonly logger;
    private redisClient;
    private redisSubscriber;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    getClient(): Redis;
    getSubscriber(): Redis;
    set(key: string, value: string, expireSeconds?: number): Promise<void>;
    get(key: string): Promise<string | null>;
    del(key: string): Promise<void>;
    subscribe(channel: string, callback: (channel: string, message: string) => void): Promise<void>;
    publish(channel: string, message: string): Promise<number>;
    unsubscribe(channel: string): Promise<void>;
}
