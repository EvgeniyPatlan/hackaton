import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { FilterLocationsDto } from './dto/filter-locations.dto';
import { Prisma } from '@prisma/client';

// Custom interface for Location
interface Location {
  id: string;
  name: string;
  address: string;
  coordinates: any; // For PostGIS Point
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
  [key: string]: any; // For additional properties
}

// Custom interface for filtering
interface LocationWhereInput {
  type?: string;
  category?: string;
  overallAccessibilityScore?: { gte: number };
  status?: string;
  [key: string]: any; // For additional properties
}

@Injectable()
export class LocationsRepository {
  private readonly logger = new Logger(LocationsRepository.name);

  constructor(private prisma: PrismaService) {}

  async findAll(filter: FilterLocationsDto) {
    const {
      page = 1,
      limit = 10,
      type,
      category,
      minAccessibilityScore,
      status,
      withFeatures,
      latitude,
      longitude,
      radius,
    } = filter;

    // Build filter criteria using our custom interface
    const where: LocationWhereInput = {
      ...(type && { type }),
      ...(category && { category }),
      ...(minAccessibilityScore && {
        overallAccessibilityScore: { gte: minAccessibilityScore },
      }),
      ...(status && { status }),
    };

    if (latitude && longitude && radius) {
      const point = `POINT(${longitude} ${latitude})`;
      
      // Use a raw SQL query for geospatial search with PostGIS
      const locationQuery = this.prisma.$queryRaw`
        SELECT * FROM "locations" 
        WHERE ST_DWithin(
          coordinates, 
          ST_SetSRID(ST_GeomFromText(${point}), 4326)::geography, 
          ${radius}
        )
        AND "type" = ${type || null}
        LIMIT ${limit} OFFSET ${(page - 1) * limit}
      `;
      
      const totalCount = await this.prisma.$queryRaw`
        SELECT COUNT(*) FROM "locations" 
        WHERE ST_DWithin(
          coordinates, 
          ST_SetSRID(ST_GeomFromText(${point}), 4326)::geography, 
          ${radius}
        )
        AND "type" = ${type || null}
      `;
      
      const locations = (await locationQuery) as unknown as Location[];
      
      return {
        data: locations,
        meta: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems: parseInt(totalCount[0].count),
          totalPages: Math.ceil(parseInt(totalCount[0].count) / limit),
        },
      };
    } else {
      // Regular paginated search using Prisma API
      const [locations, count] = await Promise.all([
        this.prisma.location.findMany({
          where: where as any,
          skip: (page - 1) * limit,
          take: limit,
          include: {
            ...(withFeatures && { features: true }),
          },
          orderBy: { updatedAt: 'desc' },
        }),
        this.prisma.location.count({ where: where as any }),
      ]);

      return {
        data: locations as unknown as Location[],
        meta: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    }
  }

  async findById(id: string, includeFeatures = false) {
    const location = await this.prisma.location.findUnique({
      where: { id },
      include: {
        ...(includeFeatures && { features: true }),
      },
    });

    if (!location) {
      throw new NotFoundException(`Location with ID "${id}" not found`);
    }

    return location as unknown as Location;
  }

  async create(
    createLocationDto: CreateLocationDto,
    userId: string,
  ): Promise<Location> {
    const { latitude, longitude, ...rest } = createLocationDto;

    try {
      // Create a PostGIS point from latitude/longitude
      const point = `POINT(${longitude} ${latitude})`;
      
      // Execute raw SQL for inserting geospatial data
      const location = await this.prisma.$queryRaw`
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
      
      return (location[0] as unknown) as Location;
    } catch (error) {
      this.logger.error(`Error creating location: ${error.message}`);
      throw error;
    }
  }

  async update(
    id: string,
    updateLocationDto: UpdateLocationDto,
  ): Promise<Location> {
    const { latitude, longitude, ...rest } = updateLocationDto;

    // Check if the location exists
    const existingLocation = await this.prisma.location.findUnique({
      where: { id },
    });

    if (!existingLocation) {
      throw new NotFoundException(`Location with ID "${id}" not found`);
    }

    try {
      let location;
      if (latitude && longitude) {
        // If coordinates are provided, update via raw SQL
        const point = `POINT(${longitude} ${latitude})`;
        
        location = await this.prisma.$queryRaw`
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
        return (location[0] as unknown) as Location;
      } else {
        // Build update data with proper type conversion for JSON fields
        const updateData: Prisma.LocationUpdateInput = {
          name: rest.name,
          address: rest.address,
          type: rest.type,
          category: rest.category,
          description: rest.description,
          contacts: rest.contacts !== undefined
            ? (rest.contacts as unknown as Prisma.JsonValue)
            : undefined,
          workingHours: rest.workingHours !== undefined
            ? (rest.workingHours as unknown as Prisma.JsonValue)
            : undefined,
          organizationId: rest.organizationId,
          status: rest.status,
          overallAccessibilityScore: rest.overallAccessibilityScore,
          updatedAt: new Date(),
        };

        location = await this.prisma.location.update({
          where: { id },
          data: updateData,
        });
        return location as unknown as Location;
      }
    } catch (error) {
      this.logger.error(`Error updating location: ${error.message}`);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const existingLocation = await this.prisma.location.findUnique({
      where: { id },
    });

    if (!existingLocation) {
      throw new NotFoundException(`Location with ID "${id}" not found`);
    }

    await this.prisma.location.delete({
      where: { id },
    });
  }

  async updateAccessibilityScore(id: string, score: number): Promise<Location> {
    const location = await this.prisma.location.update({
      where: { id },
      data: {
        overallAccessibilityScore: score,
        updatedAt: new Date(),
      },
    });
    return location as unknown as Location;
  }

  async updateStatus(id: string, status: string): Promise<Location> {
    const location = await this.prisma.location.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
    });
    return location as unknown as Location;
  }

  async findByOrganization(organizationId: string) {
    const locations = await this.prisma.location.findMany({
      where: { organizationId },
      orderBy: { updatedAt: 'desc' },
    });
    return locations as unknown as Location[];
  }

  async findByUser(userId: string) {
    const locations = await this.prisma.location.findMany({
      where: { createdBy: userId },
      orderBy: { updatedAt: 'desc' },
    });
    return locations as unknown as Location[];
  }
}
