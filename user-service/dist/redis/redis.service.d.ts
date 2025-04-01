import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
export declare class RedisService implements OnModuleInit, OnModuleDestroy {
    private configService;
    private redisClient;
    private readonly logger;
    private readonly prefix;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    getClient(): Redis;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, expireSeconds?: number): Promise<string>;
    del(key: string): Promise<number>;
    exists(key: string): Promise<number>;
    setObject(key: string, value: Record<string, any>, expireSeconds?: number): Promise<string>;
    getObject<T>(key: string): Promise<T | null>;
    getOrSet<T>(key: string, factory: () => Promise<T>, expireSeconds?: number): Promise<T>;
    invalidateByPrefix(prefix: string): Promise<void>;
}
