import { PrismaService } from '../prisma/prisma.service';
interface CreateReviewDto {
    rating: number;
    comment?: string;
    accessibilityExperience?: string;
    [key: string]: any;
}
interface UpdateReviewDto {
    rating?: number;
    comment?: string;
    accessibilityExperience?: string;
    [key: string]: any;
}
interface FilterReviewsDto {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    moderationStatus?: string;
    [key: string]: any;
}
interface Review {
    id: string;
    locationId: string;
    userId: string;
    rating: number;
    comment?: string;
    accessibilityExperience?: string;
    moderationStatus: string;
    createdAt: Date;
    updatedAt: Date;
    [key: string]: any;
}
export declare class ReviewsRepository {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAllByLocation(locationId: string, filterDto: FilterReviewsDto): Promise<{
        data: any;
        meta: {
            currentPage: number;
            itemsPerPage: number;
            totalItems: any;
            totalPages: number;
        };
    }>;
    findById(id: string): Promise<Review>;
    create(locationId: string, createReviewDto: CreateReviewDto, userId: string): Promise<Review>;
    update(id: string, updateReviewDto: UpdateReviewDto): Promise<Review>;
    delete(id: string): Promise<void>;
    updateModerationStatus(id: string, status: string): Promise<Review>;
    findByUser(userId: string): Promise<any>;
    calculateAverageRating(locationId: string): Promise<number>;
}
export {};
