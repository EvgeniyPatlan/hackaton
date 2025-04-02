import { FeaturesRepository } from './features.repository';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';
import { FilterFeaturesDto } from './dto/filter-features.dto';
import { RedisService } from '../redis/redis.service';
import { AccessibilityFeature } from '../types/models';
export declare class FeaturesService {
    private readonly featuresRepository;
    private readonly redisService;
    private readonly logger;
    private readonly CACHE_TTL;
    constructor(featuresRepository: FeaturesRepository, redisService: RedisService);
    findAllByLocation(locationId: string, filterDto: FilterFeaturesDto): Promise<any>;
    findById(id: string): Promise<any>;
    create(locationId: string, createFeatureDto: CreateFeatureDto, userId: string): Promise<AccessibilityFeature>;
    update(id: string, updateFeatureDto: UpdateFeatureDto): Promise<AccessibilityFeature>;
    delete(id: string): Promise<void>;
    private recalculateLocationScore;
    private invalidateFeatureCache;
    private publishFeatureEvent;
}
