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
var ReviewsRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReviewsRepository = ReviewsRepository_1 = class ReviewsRepository {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ReviewsRepository_1.name);
    }
    async findAllByLocation(locationId, filterDto) {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = filterDto;
        const skip = (page - 1) * limit;
        const location = await this.prisma.location.findUnique({
            where: { id: locationId },
        });
        if (!location) {
            throw new common_1.NotFoundException(`Location with ID "${locationId}" not found`);
        }
        const moderationStatus = filterDto.moderationStatus || 'approved';
        const [reviews, total] = await Promise.all([
            this.prisma.review.findMany({
                where: {
                    locationId,
                    moderationStatus,
                },
                skip,
                take: limit,
                orderBy: {
                    [sortBy]: sortOrder,
                },
            }),
            this.prisma.review.count({
                where: {
                    locationId,
                    moderationStatus,
                },
            }),
        ]);
        return {
            data: reviews,
            meta: {
                currentPage: page,
                itemsPerPage: limit,
                totalItems: total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findById(id) {
        const review = await this.prisma.review.findUnique({
            where: { id },
        });
        if (!review) {
            throw new common_1.NotFoundException(`Review with ID "${id}" not found`);
        }
        return review;
    }
    async create(locationId, createReviewDto, userId) {
        const location = await this.prisma.location.findUnique({
            where: { id: locationId },
        });
        if (!location) {
            throw new common_1.NotFoundException(`Location with ID "${locationId}" not found`);
        }
        const existingReview = await this.prisma.review.findFirst({
            where: {
                locationId,
                userId,
            },
        });
        if (existingReview) {
            return this.prisma.review.update({
                where: { id: existingReview.id },
                data: {
                    ...createReviewDto,
                    moderationStatus: 'pending',
                    updatedAt: new Date(),
                },
            });
        }
        return this.prisma.review.create({
            data: {
                ...createReviewDto,
                locationId,
                userId,
                moderationStatus: 'pending',
            },
        });
    }
    async update(id, updateReviewDto) {
        const review = await this.prisma.review.findUnique({
            where: { id },
        });
        if (!review) {
            throw new common_1.NotFoundException(`Review with ID "${id}" not found`);
        }
        return this.prisma.review.update({
            where: { id },
            data: {
                ...updateReviewDto,
                moderationStatus: 'pending',
                updatedAt: new Date(),
            },
        });
    }
    async delete(id) {
        const review = await this.prisma.review.findUnique({
            where: { id },
        });
        if (!review) {
            throw new common_1.NotFoundException(`Review with ID "${id}" not found`);
        }
        await this.prisma.review.delete({
            where: { id },
        });
    }
    async updateModerationStatus(id, status) {
        const review = await this.prisma.review.findUnique({
            where: { id },
        });
        if (!review) {
            throw new common_1.NotFoundException(`Review with ID "${id}" not found`);
        }
        return this.prisma.review.update({
            where: { id },
            data: {
                moderationStatus: status,
                updatedAt: new Date(),
            },
        });
    }
    async findByUser(userId) {
        return this.prisma.review.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async calculateAverageRating(locationId) {
        const reviews = await this.prisma.review.findMany({
            where: {
                locationId,
                moderationStatus: 'approved',
            },
            select: {
                rating: true,
            },
        });
        if (reviews.length === 0) {
            return 0;
        }
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        return totalRating / reviews.length;
    }
};
exports.ReviewsRepository = ReviewsRepository;
exports.ReviewsRepository = ReviewsRepository = ReviewsRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewsRepository);
//# sourceMappingURL=reviews.repository.js.map