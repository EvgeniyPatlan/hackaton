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
var FeaturesRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeaturesRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FeaturesRepository = FeaturesRepository_1 = class FeaturesRepository {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(FeaturesRepository_1.name);
    }
    async findAllByLocation(locationId, filterDto) {
        const { type, status, subtype } = filterDto;
        const location = await this.prisma.location.findUnique({
            where: { id: locationId },
        });
        if (!location) {
            throw new common_1.NotFoundException(`Location with ID "${locationId}" not found`);
        }
        const where = {
            locationId,
            ...(type && { type }),
            ...(subtype && { subtype }),
            ...(status !== undefined && { status }),
        };
        const features = await this.prisma.accessibilityFeature.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
        return features;
    }
    async findById(id) {
        const feature = await this.prisma.accessibilityFeature.findUnique({
            where: { id },
        });
        if (!feature) {
            throw new common_1.NotFoundException(`Feature with ID "${id}" not found`);
        }
        return feature;
    }
    async create(locationId, createFeatureDto, userId) {
        const location = await this.prisma.location.findUnique({
            where: { id: locationId },
        });
        if (!location) {
            throw new common_1.NotFoundException(`Location with ID "${locationId}" not found`);
        }
        return this.prisma.accessibilityFeature.create({
            data: {
                ...createFeatureDto,
                locationId,
                createdBy: userId,
            },
        });
    }
    async update(id, updateFeatureDto) {
        const feature = await this.prisma.accessibilityFeature.findUnique({
            where: { id },
        });
        if (!feature) {
            throw new common_1.NotFoundException(`Feature with ID "${id}" not found`);
        }
        return this.prisma.accessibilityFeature.update({
            where: { id },
            data: {
                ...updateFeatureDto,
                updatedAt: new Date(),
            },
        });
    }
    async delete(id) {
        const feature = await this.prisma.accessibilityFeature.findUnique({
            where: { id },
        });
        if (!feature) {
            throw new common_1.NotFoundException(`Feature with ID "${id}" not found`);
        }
        await this.prisma.accessibilityFeature.delete({
            where: { id },
        });
    }
    async calculateLocationScore(locationId) {
        const features = await this.prisma.accessibilityFeature.findMany({
            where: { locationId },
        });
        if (features.length === 0) {
            return 0;
        }
        let totalScore = 0;
        let maxPossibleScore = features.length * 5;
        for (const feature of features) {
            if (feature.status) {
                totalScore += feature.qualityRating || 3;
            }
        }
        const scorePercentage = (totalScore / maxPossibleScore) * 100;
        return Math.round(scorePercentage);
    }
};
exports.FeaturesRepository = FeaturesRepository;
exports.FeaturesRepository = FeaturesRepository = FeaturesRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FeaturesRepository);
//# sourceMappingURL=features.repository.js.map