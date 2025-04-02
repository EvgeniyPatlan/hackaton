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
var LocationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationsService = void 0;
const common_1 = require("@nestjs/common");
const locations_repository_1 = require("./locations.repository");
const locations_search_service_1 = require("./locations-search.service");
const redis_service_1 = require("../redis/redis.service");
let LocationsService = LocationsService_1 = class LocationsService {
    constructor(locationsRepository, locationsSearchService, redisService) {
        this.locationsRepository = locationsRepository;
        this.locationsSearchService = locationsSearchService;
        this.redisService = redisService;
        this.logger = new common_1.Logger(LocationsService_1.name);
        this.CACHE_TTL = 3600;
    }
    async findAll(filterDto) {
        if (filterDto.search) {
            return this.locationsSearchService.search(filterDto.search, filterDto.page, filterDto.limit);
        }
        const cacheKey = `locations:${JSON.stringify(filterDto)}`;
        const cachedResult = await this.redisService.get(cacheKey);
        if (cachedResult) {
            return JSON.parse(cachedResult);
        }
        const result = await this.locationsRepository.findAll(filterDto);
        await this.redisService.set(cacheKey, JSON.stringify(result), this.CACHE_TTL);
        return result;
    }
    async findById(id, includeFeatures = false) {
        const cacheKey = `location:${id}:${includeFeatures}`;
        const cachedLocation = await this.redisService.get(cacheKey);
        if (cachedLocation) {
            return JSON.parse(cachedLocation);
        }
        const location = await this.locationsRepository.findById(id, includeFeatures);
        await this.redisService.set(cacheKey, JSON.stringify(location), this.CACHE_TTL);
        return location;
    }
    async create(createLocationDto, userId) {
        const location = await this.locationsRepository.create(createLocationDto, userId);
        await this.locationsSearchService.indexLocation(location);
        await this.publishLocationEvent('location.created', location);
        return location;
    }
    async update(id, updateLocationDto, userId) {
        await this.findById(id);
        const updatedLocation = await this.locationsRepository.update(id, updateLocationDto);
        await this.locationsSearchService.updateIndexedLocation(updatedLocation);
        await this.publishLocationEvent('location.updated', updatedLocation);
        await this.invalidateLocationCache(id);
        return updatedLocation;
    }
    async delete(id) {
        await this.findById(id);
        await this.locationsRepository.delete(id);
        await this.locationsSearchService.removeIndexedLocation(id);
        await this.publishLocationEvent('location.deleted', { id });
        await this.invalidateLocationCache(id);
    }
    async updateStatus(id, status) {
        await this.findById(id);
        const updatedLocation = await this.locationsRepository.updateStatus(id, status);
        await this.locationsSearchService.updateIndexedLocation(updatedLocation);
        await this.publishLocationEvent('location.status_updated', updatedLocation);
        await this.invalidateLocationCache(id);
        return updatedLocation;
    }
    async updateAccessibilityScore(id, score) {
        await this.findById(id);
        const updatedLocation = await this.locationsRepository.updateAccessibilityScore(id, score);
        await this.locationsSearchService.updateIndexedLocation(updatedLocation);
        await this.publishLocationEvent('location.score_updated', updatedLocation);
        await this.invalidateLocationCache(id);
        return updatedLocation;
    }
    async findByOrganization(organizationId) {
        return this.locationsRepository.findByOrganization(organizationId);
    }
    async findByUser(userId) {
        return this.locationsRepository.findByUser(userId);
    }
    async invalidateLocationCache(id) {
        await this.redisService.del(`location:${id}:true`);
        await this.redisService.del(`location:${id}:false`);
        const redisClient = this.redisService.getClient();
        const keys = await redisClient.keys('locations:*');
        if (keys.length > 0) {
            await redisClient.del(...keys);
        }
    }
    async publishLocationEvent(event, data) {
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
exports.LocationsService = LocationsService;
exports.LocationsService = LocationsService = LocationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [locations_repository_1.LocationsRepository,
        locations_search_service_1.LocationsSearchService,
        redis_service_1.RedisService])
], LocationsService);
//# sourceMappingURL=locations.service.js.map