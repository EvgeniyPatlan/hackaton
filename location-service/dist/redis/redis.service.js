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
        const redisHost = this.configService.get('REDIS_HOST', 'redis');
        const redisPort = this.configService.get('REDIS_PORT', 6379);
        this.redisClient = new ioredis_1.default({
            host: redisHost,
            port: redisPort,
            lazyConnect: true,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
        });
        this.redisSubscriber = new ioredis_1.default({
            host: redisHost,
            port: redisPort,
            lazyConnect: true,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
        });
    }
    async onModuleInit() {
        await this.redisClient.connect();
        await this.redisSubscriber.connect();
        this.logger.log('Successfully connected to Redis');
        this.redisClient.on('error', (err) => {
            this.logger.error(`Redis client error: ${err.message}`);
        });
        this.redisSubscriber.on('error', (err) => {
            this.logger.error(`Redis subscriber error: ${err.message}`);
        });
    }
    async onModuleDestroy() {
        await this.redisClient.quit();
        await this.redisSubscriber.quit();
        this.logger.log('Successfully disconnected from Redis');
    }
    getClient() {
        return this.redisClient;
    }
    getSubscriber() {
        return this.redisSubscriber;
    }
    async set(key, value, expireSeconds) {
        if (expireSeconds) {
            await this.redisClient.set(key, value, 'EX', expireSeconds);
        }
        else {
            await this.redisClient.set(key, value);
        }
    }
    async get(key) {
        return this.redisClient.get(key);
    }
    async del(key) {
        await this.redisClient.del(key);
    }
    async subscribe(channel, callback) {
        await this.redisSubscriber.subscribe(channel);
        this.redisSubscriber.on('message', callback);
    }
    async publish(channel, message) {
        return this.redisClient.publish(channel, message);
    }
    async unsubscribe(channel) {
        await this.redisSubscriber.unsubscribe(channel);
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map