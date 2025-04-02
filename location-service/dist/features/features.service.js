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
var FeaturesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeaturesService = void 0;
const common_1 = require("@nestjs/common");
const features_repository_1 = require("./features.repository");
const redis_service_1 = require("../redis/redis.service");
let FeaturesService = FeaturesService_1 = class FeaturesService {
    constructor(featuresRepository, redisService) {
        this.featuresRepository = featuresRepository;
        this.redisService = redisService;
        this.logger = new common_1.Logger(FeaturesService_1.name);
        this.CACHE_TTL = 3600;
    }
    async findAllByLocation(locationId, filterDto) {
        const cacheKey = `features:location:${locationId}:${JSON.stringify(filterDto)}`;
        const cachedResult = await this.redisService.get(cacheKey);
        if (cachedResult) {
            return JSON.parse(cachedResult);
        }
        const features = await this.featuresRepository.findAllByLocation(locationId, filterDto);
        await this.redisService.set(cacheKey, JSON.stringify(features), this.CACHE_TTL);
        return features;
    }
    async findById(id) {
        const cacheKey = `feature:${id}`;
        const cachedFeature = await this.redisService.get(cacheKey);
        if (cachedFeature) {
            return JSON.parse(cachedFeature);
        }
        const feature = await this.featuresRepository.findById(id);
        await this.redisService.set(cacheKey, JSON.stringify(feature), this.CACHE_TTL);
        return feature;
    }
    async create(locationId, createFeatureDto, userId) {
        const feature = await this.featuresRepository.create(locationId, createFeatureDto, userId);
        await this.recalculateLocationScore(locationId);
        await this.publishFeatureEvent('feature.created', feature);
        await this.invalidateFeatureCache(feature.id, locationId);
        return feature;
    }
    async update(id, updateFeatureDto) {
        const currentFeature = await this.findById(id);
        const locationId = currentFeature.locationId;
        const updatedFeature = await this.featuresRepository.update(id, updateFeatureDto);
        await this.recalculateLocationScore(locationId);
        await this.publishFeatureEvent('feature.updated', updatedFeature);
        await this.invalidateFeatureCache(id, locationId);
        return updatedFeature;
    }
    async delete(id) {
        const currentFeature = await this.findById(id);
        const locationId = currentFeature.locationId;
        await this.featuresRepository.delete(id);
        await this.recalculateLocationScore(locationId);
        await this.publishFeatureEvent('feature.deleted', { id, locationId });
        await this.invalidateFeatureCache(id, locationId);
    }
    async recalculateLocationScore(locationId) {
        try {
            const score = await this.featuresRepository.calculateLocationScore(locationId);
            const prisma = this.featuresRepository['prisma'];
            await prisma.location.update({
                where: { id: locationId },
                data: {
                    overallAccessibilityScore: score,
                    updatedAt: new Date(),
                },
            });
            this.logger.log(`Recalculated accessibility score for location ${locationId}: ${score}`);
            await this.publishFeatureEvent('location.score_updated', {
                id: locationId,
                overallAccessibilityScore: score
            });
        }
        catch (error) {
            this.logger.error(`Error recalculating accessibility score: ${error.message}`);
        }
    }
    async invalidateFeatureCache(id, locationId) {
        await this.redisService.del(`feature:${id}`);
        const redisClient = this.redisService.getClient();
        const keys = await redisClient.keys(`features:location:${locationId}:*`);
        if (keys.length > 0) {
            await redisClient.del(...keys);
        }
        const locationKeys = await redisClient.keys(`location:${locationId}:*`);
        if (locationKeys.length > 0) {
            await redisClient.del(...locationKeys);
        }
    }
    async publishFeatureEvent(event, data) {
        try {
            const message = JSON.stringify({
                event,
                data,
                timestamp: new Date().toISOString(),
            });
            await this.redisService.publish(event, message);
            this.logger.log(`Published event: ${event}`);
        }
        catch (error) {
            this.logger.error(`Error publishing event ${event}: ${error.message}`);
        }
    }
};
exports.FeaturesService = FeaturesService;
exports.FeaturesService = FeaturesService = FeaturesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [features_repository_1.FeaturesRepository,
        redis_service_1.RedisService])
], FeaturesService);
//# sourceMappingURL=features.service.js.map