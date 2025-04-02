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
var LocationsRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let LocationsRepository = LocationsRepository_1 = class LocationsRepository {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(LocationsRepository_1.name);
    }
    async findAll(filter) {
        const { page = 1, limit = 10, type, category, minAccessibilityScore, status, withFeatures, latitude, longitude, radius, } = filter;
        const where = {
            ...(type && { type }),
            ...(category && { category }),
            ...(minAccessibilityScore && {
                overallAccessibilityScore: { gte: minAccessibilityScore },
            }),
            ...(status && { status }),
        };
        let locationQuery = this.prisma.location;
        if (latitude && longitude && radius) {
            const point = `POINT(${longitude} ${latitude})`;
            locationQuery = this.prisma.$queryRaw `
        SELECT * FROM "locations" 
        WHERE ST_DWithin(
          coordinates, 
          ST_SetSRID(ST_GeomFromText(${point}), 4326)::geography, 
          ${radius}
        )
        AND "type" = ${type || null}
        LIMIT ${limit} OFFSET ${(page - 1) * limit}
      `;
            const totalCount = await this.prisma.$queryRaw `
        SELECT COUNT(*) FROM "locations" 
        WHERE ST_DWithin(
          coordinates, 
          ST_SetSRID(ST_GeomFromText(${point}), 4326)::geography, 
          ${radius}
        )
        AND "type" = ${type || null}
      `;
            const locations = await locationQuery;
            return {
                data: locations,
                meta: {
                    currentPage: page,
                    itemsPerPage: limit,
                    totalItems: parseInt(totalCount[0].count),
                    totalPages: Math.ceil(parseInt(totalCount[0].count) / limit),
                },
            };
        }
        else {
            const [locations, count] = await Promise.all([
                this.prisma.location.findMany({
                    where: where,
                    skip: (page - 1) * limit,
                    take: limit,
                    include: {
                        ...(withFeatures && { features: true }),
                    },
                    orderBy: { updatedAt: 'desc' },
                }),
                this.prisma.location.count({ where: where }),
            ]);
            return {
                data: locations,
                meta: {
                    currentPage: page,
                    itemsPerPage: limit,
                    totalItems: count,
                    totalPages: Math.ceil(count / limit),
                },
            };
        }
    }
    async findById(id, includeFeatures = false) {
        const location = await this.prisma.location.findUnique({
            where: { id },
            include: {
                ...(includeFeatures && { features: true }),
            },
        });
        if (!location) {
            throw new common_1.NotFoundException(`Location with ID "${id}" not found`);
        }
        return location;
    }
    async create(createLocationDto, userId) {
        const { latitude, longitude, ...rest } = createLocationDto;
        try {
            const point = `POINT(${longitude} ${latitude})`;
            const location = await this.prisma.$queryRaw `
        INSERT INTO "locations" (
          id, 
          name, 
          address, 
          coordinates, 
          type, 
          category, 
          description, 
          contacts, 
          working_hours, 
          created_by, 
          organization_id, 
          status, 
          overall_accessibility_score, 
          created_at, 
          updated_at
        )
        VALUES (
          gen_random_uuid(), 
          ${rest.name}, 
          ${rest.address}, 
          ST_SetSRID(ST_GeomFromText(${point}), 4326), 
          ${rest.type}, 
          ${rest.category || null}, 
          ${rest.description || null}, 
          ${rest.contacts ? JSON.stringify(rest.contacts) : null}::jsonb, 
          ${rest.workingHours ? JSON.stringify(rest.workingHours) : null}::jsonb, 
          ${userId}, 
          ${rest.organizationId || null}, 
          ${rest.status || 'draft'}, 
          ${rest.overallAccessibilityScore || null}, 
          NOW(), 
          NOW()
        )
        RETURNING *;
      `;
            return location[0];
        }
        catch (error) {
            this.logger.error(`Error creating location: ${error.message}`);
            throw error;
        }
    }
    async update(id, updateLocationDto) {
        const { latitude, longitude, ...rest } = updateLocationDto;
        const existingLocation = await this.prisma.location.findUnique({
            where: { id },
        });
        if (!existingLocation) {
            throw new common_1.NotFoundException(`Location with ID "${id}" not found`);
        }
        try {
            let location;
            if (latitude && longitude) {
                const point = `POINT(${longitude} ${latitude})`;
                location = await this.prisma.$queryRaw `
          UPDATE "locations"
          SET 
            name = COALESCE(${rest.name}, name),
            address = COALESCE(${rest.address}, address),
            coordinates = COALESCE(ST_SetSRID(ST_GeomFromText(${point}), 4326), coordinates),
            type = COALESCE(${rest.type}, type),
            category = COALESCE(${rest.category}, category),
            description = COALESCE(${rest.description}, description),
            contacts = COALESCE(${rest.contacts ? JSON.stringify(rest.contacts) : null}::jsonb, contacts),
            working_hours = COALESCE(${rest.workingHours ? JSON.stringify(rest.workingHours) : null}::jsonb, working_hours),
            organization_id = COALESCE(${rest.organizationId}, organization_id),
            status = COALESCE(${rest.status}, status),
            overall_accessibility_score = COALESCE(${rest.overallAccessibilityScore}, overall_accessibility_score),
            updated_at = NOW()
          WHERE id = ${id}
          RETURNING *;
        `;
            }
            else {
                location = await this.prisma.location.update({
                    where: { id },
                    data: {
                        ...rest,
                        updatedAt: new Date(),
                    },
                });
            }
            return location[0] || location;
        }
        catch (error) {
            this.logger.error(`Error updating location: ${error.message}`);
            throw error;
        }
    }
    async delete(id) {
        const existingLocation = await this.prisma.location.findUnique({
            where: { id },
        });
        if (!existingLocation) {
            throw new common_1.NotFoundException(`Location with ID "${id}" not found`);
        }
        await this.prisma.location.delete({
            where: { id },
        });
    }
    async updateAccessibilityScore(id, score) {
        return this.prisma.location.update({
            where: { id },
            data: {
                overallAccessibilityScore: score,
                updatedAt: new Date(),
            },
        });
    }
    async updateStatus(id, status) {
        return this.prisma.location.update({
            where: { id },
            data: {
                status,
                updatedAt: new Date(),
            },
        });
    }
    async findByOrganization(organizationId) {
        return this.prisma.location.findMany({
            where: { organizationId },
            orderBy: { updatedAt: 'desc' },
        });
    }
    async findByUser(userId) {
        return this.prisma.location.findMany({
            where: { createdBy: userId },
            orderBy: { updatedAt: 'desc' },
        });
    }
};
exports.LocationsRepository = LocationsRepository;
exports.LocationsRepository = LocationsRepository = LocationsRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LocationsRepository);
//# sourceMappingURL=locations.repository.js.map