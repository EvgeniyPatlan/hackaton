import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { FilterLocationsDto } from './dto/filter-locations.dto';
import { Prisma, Location } from '@prisma/client';

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

    // Базовий фільтр
    const where: Prisma.LocationWhereInput = {
      ...(type && { type }),
      ...(category && { category }),
      ...(minAccessibilityScore && {
        overallAccessibilityScore: { gte: minAccessibilityScore },
      }),
      ...(status && { status }),
    };

    // Якщо вказано координати та радіус, шукаємо об'єкти в радіусі
    let locationQuery: any = this.prisma.location;
    if (latitude && longitude && radius) {
      // Використовуємо PostGIS для пошуку в радіусі
      // ST_DWithin повертає true, якщо відстань між точками менше або дорівнює вказаному радіусу
      const point = `POINT(${longitude} ${latitude})`;
      
      // Формуємо SQL запит для пошуку по радіусу (радіус у метрах)
      locationQuery = this.prisma.$queryRaw`
        SELECT * FROM "locations" 
        WHERE ST_DWithin(
          coordinates, 
          ST_SetSRID(ST_GeomFromText(${point}), 4326)::geography, 
          ${radius}
        )
        AND "type" = ${type || Prisma.DbNull}
        LIMIT ${limit} OFFSET ${(page - 1) * limit}
      `;
      
      // Рахуємо загальну кількість знайдених об'єктів
      const totalCount = await this.prisma.$queryRaw`
        SELECT COUNT(*) FROM "locations" 
        WHERE ST_DWithin(
          coordinates, 
          ST_SetSRID(ST_GeomFromText(${point}), 4326)::geography, 
          ${radius}
        )
        AND "type" = ${type || Prisma.DbNull}
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
    } else {
      // Звичайний пошук з пагінацією
      const [locations, count] = await Promise.all([
        this.prisma.location.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          include: {
            ...(withFeatures && { features: true }),
          },
          orderBy: { updatedAt: 'desc' },
        }),
        this.prisma.location.count({ where }),
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

    return location;
  }

  async create(
    createLocationDto: CreateLocationDto,
    userId: string,
  ): Promise<Location> {
    const { latitude, longitude, ...rest } = createLocationDto;

    try {
      // Створюємо геометричну точку з координат
      const point = `POINT(${longitude} ${latitude})`;
      
      // Виконуємо SQL запит для створення об'єкта з геопросторовими даними
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

      return location[0];
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

    // Перевіряємо, чи існує локація
    const existingLocation = await this.prisma.location.findUnique({
      where: { id },
    });

    if (!existingLocation) {
      throw new NotFoundException(`Location with ID "${id}" not found`);
    }

    try {
      let location;

      // Якщо передані координати, оновлюємо геодані
      if (latitude && longitude) {
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
      } else {
        // Якщо координати не передані, використовуємо Prisma API
        location = await this.prisma.location.update({
          where: { id },
          data: {
            ...rest,
            updatedAt: new Date(),
          },
        });
      }

      return location[0] || location;
    } catch (error) {
      this.logger.error(`Error updating location: ${error.message}`);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    // Перевіряємо, чи існує локація
    const existingLocation = await this.prisma.location.findUnique({
      where: { id },
    });

    if (!existingLocation) {
      throw new NotFoundException(`Location with ID "${id}" not found`);
    }

    // Видаляємо локацію (каскадне видалення буде працювати завдяки обмеженням зв'язків у БД)
    await this.prisma.location.delete({
      where: { id },
    });
  }

  async updateAccessibilityScore(id: string, score: number): Promise<Location> {
    return this.prisma.location.update({
      where: { id },
      data: {
        overallAccessibilityScore: score,
        updatedAt: new Date(),
      },
    });
  }

  async updateStatus(id: string, status: string): Promise<Location> {
    return this.prisma.location.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
    });
  }

  async findByOrganization(organizationId: string) {
    return this.prisma.location.findMany({
      where: { organizationId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.location.findMany({
      where: { createdBy: userId },
      orderBy: { updatedAt: 'desc' },
    });
  }
}
