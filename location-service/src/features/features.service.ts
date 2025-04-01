import { Injectable, Logger } from '@nestjs/common';
import { FeaturesRepository } from './features.repository';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';
import { FilterFeaturesDto } from './dto/filter-features.dto';
import { RedisService } from '../redis/redis.service';
import { AccessibilityFeature } from '../types/models';

@Injectable()
export class FeaturesService {
  private readonly logger = new Logger(FeaturesService.name);
  private readonly CACHE_TTL = 3600; // 1 година

  constructor(
    private readonly featuresRepository: FeaturesRepository,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Отримання всіх елементів безбар'єрності для локації
   */
  async findAllByLocation(locationId: string, filterDto: FilterFeaturesDto) {
    // Перевіряємо, чи є кеш для цього запиту
    const cacheKey = `features:location:${locationId}:${JSON.stringify(filterDto)}`;
    const cachedResult = await this.redisService.get(cacheKey);

    if (cachedResult) {
      return JSON.parse(cachedResult);
    }

    // Якщо кешу немає, отримуємо з БД
    const features = await this.featuresRepository.findAllByLocation(
      locationId,
      filterDto,
    );

    // Кешуємо результат
    await this.redisService.set(
      cacheKey,
      JSON.stringify(features),
      this.CACHE_TTL,
    );

    return features;
  }

  /**
   * Отримання елементу безбар'єрності за ID
   */
  async findById(id: string) {
    // Перевіряємо, чи є кеш
    const cacheKey = `feature:${id}`;
    const cachedFeature = await this.redisService.get(cacheKey);

    if (cachedFeature) {
      return JSON.parse(cachedFeature);
    }

    // Якщо кешу немає, отримуємо з БД
    const feature = await this.featuresRepository.findById(id);

    // Кешуємо результат
    await this.redisService.set(
      cacheKey,
      JSON.stringify(feature),
      this.CACHE_TTL,
    );

    return feature;
  }

  /**
   * Створення нового елементу безбар'єрності
   */
  async create(
    locationId: string,
    createFeatureDto: CreateFeatureDto,
    userId: string,
  ): Promise<AccessibilityFeature> {
    // Створюємо елемент безбар'єрності
    const feature = await this.featuresRepository.create(
      locationId,
      createFeatureDto,
      userId,
    );

    // Перераховуємо загальну оцінку доступності локації
    await this.recalculateLocationScore(locationId);

    // Публікуємо подію про створення елементу для інших сервісів
    await this.publishFeatureEvent('feature.created', feature);

    // Видаляємо кеш
    await this.invalidateFeatureCache(feature.id, locationId);

    return feature;
  }

  /**
   * Оновлення елементу безбар'єрності
   */
  async update(id: string, updateFeatureDto: UpdateFeatureDto): Promise<AccessibilityFeature> {
    // Отримуємо поточний елемент для визначення ID локації
    const currentFeature = await this.findById(id);
    const locationId = currentFeature.locationId;

    // Оновлюємо елемент безбар'єрності
    const updatedFeature = await this.featuresRepository.update(
      id,
      updateFeatureDto,
    );

    // Перераховуємо загальну оцінку доступності локації
    await this.recalculateLocationScore(locationId);

    // Публікуємо подію про оновлення елементу для інших сервісів
    await this.publishFeatureEvent('feature.updated', updatedFeature);

    // Видаляємо кеш
    await this.invalidateFeatureCache(id, locationId);

    return updatedFeature;
  }

  /**
   * Видалення елементу безбар'єрності
   */
  async delete(id: string) {
    // Отримуємо поточний елемент для визначення ID локації
    const currentFeature = await this.findById(id);
    const locationId = currentFeature.locationId;

    // Видаляємо елемент безбар'єрності
    await this.featuresRepository.delete(id);

    // Перераховуємо загальну оцінку доступності локації
    await this.recalculateLocationScore(locationId);

    // Публікуємо подію про видалення елементу для інших сервісів
    await this.publishFeatureEvent('feature.deleted', { id, locationId });

    // Видаляємо кеш
    await this.invalidateFeatureCache(id, locationId);
  }

  /**
   * Перерахунок загальної оцінки доступності локації
   */
  private async recalculateLocationScore(locationId: string) {
    try {
      const score = await this.featuresRepository.calculateLocationScore(locationId);
      
      // Оновлюємо оцінку у локації через сервіс LocationsService
      // В реальному проекті можна використати клієнт для HTTP запитів або PubSub
      // Тут показано спрощений варіант через виклик репозиторію напряму
      const prisma = this.featuresRepository['prisma']; // Отримуємо prisma з репозиторію

      await prisma.location.update({
        where: { id: locationId },
        data: {
          overallAccessibilityScore: score,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Recalculated accessibility score for location ${locationId}: ${score}`);
      
      // Публікуємо подію про оновлення оцінки для інших сервісів
      await this.publishFeatureEvent('location.score_updated', { 
        id: locationId, 
        overallAccessibilityScore: score 
      });
    } catch (error) {
      this.logger.error(`Error recalculating accessibility score: ${error.message}`);
    }
  }

  /**
   * Видалення кешу елементу безбар'єрності
   */
  private async invalidateFeatureCache(id: string, locationId: string) {
    // Видаляємо конкретний кеш для елемента
    await this.redisService.del(`feature:${id}`);

    // Шукаємо та видаляємо всі кеші для списків елементів локації
    const redisClient = this.redisService.getClient();
    const keys = await redisClient.keys(`features:location:${locationId}:*`);
    
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }

    // Також видаляємо кеш для локації, оскільки змінився її рейтинг
    const locationKeys = await redisClient.keys(`location:${locationId}:*`);
    
    if (locationKeys.length > 0) {
      await redisClient.del(...locationKeys);
    }
  }

  /**
   * Публікація події про елемент безбар'єрності для інших сервісів
   */
  private async publishFeatureEvent(event: string, data: any) {
    try {
      const message = JSON.stringify({
        event,
        data,
        timestamp: new Date().toISOString(),
      });

      await this.redisService.publish(event, message);
      this.logger.log(`Published event: ${event}`);
    } catch (error) {
      this.logger.error(`Error publishing event ${event}: ${error.message}`);
    }
  }
}
