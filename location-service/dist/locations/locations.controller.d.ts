import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { FilterLocationsDto } from './dto/filter-locations.dto';
export declare class LocationsController {
    private readonly locationsService;
    constructor(locationsService: LocationsService);
    findAll(filterDto: FilterLocationsDto): Promise<any>;
    findOne(id: string, includeFeatures: boolean): Promise<import("../types/models").Location>;
    create(createLocationDto: CreateLocationDto, req: any): Promise<import("../types/models").Location>;
    update(id: string, updateLocationDto: UpdateLocationDto, req: any): Promise<import("../types/models").Location>;
    remove(id: string): Promise<void>;
    updateStatus(id: string, status: string): Promise<import("../types/models").Location>;
    updateScore(id: string, score: number): Promise<import("../types/models").Location>;
    findByOrganization(organizationId: string): Promise<import("../types/models").Location[]>;
    findByCurrentUser(req: any): Promise<import("../types/models").Location[]>;
}
