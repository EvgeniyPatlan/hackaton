import { LocationsRepository } from './locations.repository';
import { LocationsSearchService } from './locations-search.service';
import { RedisService } from '../redis/redis.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { FilterLocationsDto } from './dto/filter-locations.dto';
import { Location } from '../types/models';
export declare class LocationsService {
    private readonly locationsRepository;
    private readonly locationsSearchService;
    private readonly redisService;
    private readonly logger;
    private readonly CACHE_TTL;
    constructor(locationsRepository: LocationsRepository, locationsSearchService: LocationsSearchService, redisService: RedisService);
    findAll(filterDto: FilterLocationsDto): Promise<any>;
    findById(id: string, includeFeatures?: boolean): Promise<Location>;
    create(createLocationDto: CreateLocationDto, userId: string): Promise<Location>;
    update(id: string, updateLocationDto: UpdateLocationDto, userId: string): Promise<Location>;
    delete(id: string): Promise<void>;
    updateStatus(id: string, status: string): Promise<Location>;
    updateAccessibilityScore(id: string, score: number): Promise<Location>;
    findByOrganization(organizationId: string): Promise<Location[]>;
    findByUser(userId: string): Promise<Location[]>;
    private invalidateLocationCache;
    private publishLocationEvent;
}
