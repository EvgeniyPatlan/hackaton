import { FeaturesService } from './features.service';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';
import { FilterFeaturesDto } from './dto/filter-features.dto';
import { AccessibilityFeature } from '../types/models';
export declare class FeaturesController {
    private readonly featuresService;
    constructor(featuresService: FeaturesService);
    findAll(locationId: string, filterDto: FilterFeaturesDto): Promise<any>;
    findOne(id: string): Promise<any>;
    create(locationId: string, createFeatureDto: CreateFeatureDto, req: any): Promise<AccessibilityFeature>;
    update(id: string, updateFeatureDto: UpdateFeatureDto): Promise<AccessibilityFeature>;
    remove(id: string): Promise<void>;
}
