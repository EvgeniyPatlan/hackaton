import { PrismaService } from '../prisma/prisma.service';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';
import { FilterFeaturesDto } from './dto/filter-features.dto';
interface AccessibilityFeature {
    id: string;
    locationId: string;
    type: string;
    subtype?: string;
    description?: string;
    status: boolean;
    qualityRating?: number;
    standardsCompliance?: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    [key: string]: any;
}
export declare class FeaturesRepository {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAllByLocation(locationId: string, filterDto: FilterFeaturesDto): Promise<any>;
    findById(id: string): Promise<AccessibilityFeature>;
    create(locationId: string, createFeatureDto: CreateFeatureDto, userId: string): Promise<AccessibilityFeature>;
    update(id: string, updateFeatureDto: UpdateFeatureDto): Promise<AccessibilityFeature>;
    delete(id: string): Promise<void>;
    calculateLocationScore(locationId: string): Promise<number>;
}
export {};
