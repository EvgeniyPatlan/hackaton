import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';
import { FilterFeaturesDto } from './dto/filter-features.dto';
import { AccessibilityFeature } from '@prisma/client';

@Injectable()
export class FeaturesRepository {
  private readonly logger = new Logger(FeaturesRepository.name);

  constructor(private prisma: PrismaService) {}

  async findAllByLocation(
    locationId: string,
    filterDto: FilterFeaturesDto,
  ) {
    const { type, status, subtype } = filterDto;

    // Перевіряємо, чи існує локація
    const location = await this.prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      throw new NotFoundException(`Location with ID "${locationId}" not found`);
    }

    // Створюємо базовий фільтр
    const where = {
      locationId,
      ...(type && { type }),
      ...(subtype && { subtype }),
      ...(status !== undefined && { status }),
    };

    // Отримуємо елементи безбар'єрності
    const features = await this.prisma.accessibilityFeature.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return features;
  }

  async findById(id: string): Promise<AccessibilityFeature> {
    const feature = await this.prisma.accessibilityFeature.findUnique({
      where: { id },
    });

    if (!feature) {
      throw new NotFoundException(`Feature with ID "${id}" not found`);
    }

    return feature;
  }

  async create(
    locationId: string,
    createFeatureDto: CreateFeatureDto,
    userId: string,
  ): Promise<AccessibilityFeature> {
    // Перевіряємо, чи існує локація
    const location = await this.prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      throw new NotFoundException(`Location with ID "${locationId}" not found`);
    }

    // Створюємо елемент безбар'єрності
    return this.prisma.accessibilityFeature.create({
      data: {
        ...createFeatureDto,
        locationId,
        createdBy: userId,
      },
    });
  }

  async update(
    id: string,
    updateFeatureDto: UpdateFeatureDto,
  ): Promise<AccessibilityFeature> {
    // Перевіряємо, чи існує елемент безбар'єрності
    const feature = await this.prisma.accessibilityFeature.findUnique({
      where: { id },
    });

    if (!feature) {
      throw new NotFoundException(`Feature with ID "${id}" not found`);
    }

    // Оновлюємо елемент безбар'єрності
    return this.prisma.accessibilityFeature.update({
      where: { id },
      data: {
        ...updateFeatureDto,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<void> {
    // Перевіряємо, чи існує елемент безбар'єрності
    const feature = await this.prisma.accessibilityFeature.findUnique({
      where: { id },
    });

    if (!feature) {
      throw new NotFoundException(`Feature with ID "${id}" not found`);
    }

    // Видаляємо елемент безбар'єрності
    await this.prisma.accessibilityFeature.delete({
      where: { id },
    });
  }

  async calculateLocationScore(locationId: string): Promise<number> {
    // Отримуємо всі елементи безбар'єрності локації
    const features = await this.prisma.accessibilityFeature.findMany({
      where: { locationId },
    });

    if (features.length === 0) {
      return 0;
    }

    // Обчислюємо загальну оцінку на основі статусу та якості елементів
    let totalScore = 0;
    let maxPossibleScore = features.length * 5; // Максимально можлива оцінка (5 балів на елемент)

    for (const feature of features) {
      if (feature.status) {
        // Якщо елемент наявний, враховуємо його якість
        totalScore += feature.qualityRating || 3; // Якщо якість не вказана, використовуємо середню оцінку
      }
      // Якщо елемент відсутній, додаємо 0
    }

    // Обчислюємо відсоток від максимально можливої оцінки
    const scorePercentage = (totalScore / maxPossibleScore) * 100;

    // Повертаємо округлене значення
    return Math.round(scorePercentage);
  }
}
