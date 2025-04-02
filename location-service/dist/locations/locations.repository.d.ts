import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { FilterLocationsDto } from './dto/filter-locations.dto';
interface Location {
    id: string;
    name: string;
    address: string;
    coordinates: any;
    type: string;
    category?: string;
    description?: string;
    contacts?: any;
    workingHours?: any;
    createdBy: string;
    organizationId?: string;
    status: string;
    overallAccessibilityScore?: number;
    createdAt: Date;
    updatedAt: Date;
    lastVerifiedAt?: Date;
    rejectionReason?: string;
    [key: string]: any;
}
export declare class LocationsRepository {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(filter: FilterLocationsDto): Promise<{
        data: any;
        meta: {
            currentPage: number;
            itemsPerPage: number;
            totalItems: any;
            totalPages: number;
        };
    }>;
    findById(id: string, includeFeatures?: boolean): Promise<any>;
    create(createLocationDto: CreateLocationDto, userId: string): Promise<Location>;
    update(id: string, updateLocationDto: UpdateLocationDto): Promise<Location>;
    delete(id: string): Promise<void>;
    updateAccessibilityScore(id: string, score: number): Promise<Location>;
    updateStatus(id: string, status: string): Promise<Location>;
    findByOrganization(organizationId: string): Promise<any>;
    findByUser(userId: string): Promise<any>;
}
export {};
