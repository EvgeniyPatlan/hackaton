"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = require("ioredis");
let RedisService = RedisService_1 = class RedisService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(RedisService_1.name);
        this.prefix = 'user-service:';
        const redisUrl = this.configService.get('REDIS_URL');
        this.redisClient = new ioredis_1.default(redisUrl);
    }
    async onModuleInit() {
        try {
            await this.redisClient.ping();
            this.logger.log('Successfully connected to Redis');
        }
        catch (e) {
            this.logger.error('Failed to connect to Redis', e);
            throw e;
        }
    }
    async onModuleDestroy() {
        await this.redisClient.quit();
        this.logger.log('Redis connection closed');
    }
    getClient() {
        return this.redisClient;
    }
    async get(key) {
        return this.redisClient.get(`${this.prefix}${key}`);
    }
    async set(key, value, expireSeconds) {
        if (expireSeconds) {
            return this.redisClient.set(`${this.prefix}${key}`, value, 'EX', expireSeconds);
        }
        return this.redisClient.set(`${this.prefix}${key}`, value);
    }
    async del(key) {
        return this.redisClient.del(`${this.prefix}${key}`);
    }
    async exists(key) {
        return this.redisClient.exists(`${this.prefix}${key}`);
    }
    async setObject(key, value, expireSeconds) {
        return this.set(key, JSON.stringify(value), expireSeconds);
    }
    async getObject(key) {
        const data = await this.get(key);
        if (!data)
            return null;
        try {
            return JSON.parse(data);
        }
        catch (e) {
            this.logger.error(`Failed to parse Redis data for key ${key}`, e);
            return null;
        }
    }
    async getOrSet(key, factory, expireSeconds) {
        const cached = await this.getObject(key);
        if (cached) {
            return cached;
        }
        const result = await factory();
        await this.setObject(key, result, expireSeconds);
        return result;
    }
    async invalidateByPrefix(prefix) {
        const fullPrefix = `${this.prefix}${prefix}`;
        const keys = await this.redisClient.keys(`${fullPrefix}*`);
        if (keys.length > 0) {
            await this.redisClient.del(...keys);
            this.logger.debug(`Invalidated ${keys.length} keys with prefix ${prefix}`);
        }
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map