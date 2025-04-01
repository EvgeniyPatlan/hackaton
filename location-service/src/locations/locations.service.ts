import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { LocationsRepository } from './locations.repository';
import { LocationsSearchService } from './locations-search.service';
import { RedisService } from '../redis/redis.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { FilterLocationsDto } from './dto/filter-locations.dto';
// Імпортуємо тип Location з нашого нового файлу інтерфейсів
import { Location } from '../types/models';

@Injectable()
export class LocationsService {
  private readonly logger = new Logger(LocationsService.name);
  private readonly CACHE_TTL = 3600; // 1 година

  constructor(
    private readonly locationsRepository: LocationsRepository,
    private readonly locationsSearchService: LocationsSearchService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Отримання всіх локацій з фільтрацією
   */
  async findAll(filterDto: FilterLocationsDto) {
    // Якщо є пошуковий запит, використовуємо Elasticsearch
    if (filterDto.search) {
      return this.locationsSearchService.search(
        filterDto.search,
        filterDto.page,
        filterDto.limit,
      );
    }

    // Інакше використовуємо стандартний пошук через репозиторій
    // Перевіряємо, чи є кеш для цього запиту
    const cacheKey = `locations:${JSON.stringify(filterDto)}`;
    const cachedResult = await this.redisService.get(cacheKey);

    if (cachedResult) {
      return JSON.parse(cachedResult);
    }

    // Якщо кешу немає, отримуємо з БД
    const result = await this.locationsRepository.findAll(filterDto);

    // Кешуємо результат
    await this.redisService.set(
      cacheKey,
      JSON.stringify(result),
      this.CACHE_TTL,
    );

    return result;
  }

  /**
   * Отримання локації за ID
   */
  async findById(id: string, includeFeatures = false): Promise<Location> {
    // Перевіряємо, чи є кеш
    const cacheKey = `location:${id}:${includeFeatures}`;
    const cachedLocation = await this.redisService.get(cacheKey);

    if (cachedLocation) {
      return JSON.parse(cachedLocation);
    }

    // Якщо кешу немає, отримуємо з БД
    const location = await this.locationsRepository.findById(id, includeFeatures);

    // Кешуємо результат
    await this.redisService.set(
      cacheKey,
      JSON.stringify(location),
      this.CACHE_TTL,
    );

    return location;
  }

  /**
   * Створення нової локації
   */
  async create(createLocationDto: CreateLocationDto, userId: string): Promise<Location> {
    // Створюємо локацію
    const location = await this.locationsRepository.create(
      createLocationDto,
      userId,
    );

    // Індексуємо в Elasticsearch
    await this.locationsSearchService.indexLocation(location);

    // Публікуємо подію про створення локації для інших сервісів
    await this.publishLocationEvent('location.created', location);

    return location;
  }

  /**
   * Оновлення локації
   */
  async update(id: string, updateLocationDto: UpdateLocationDto, userId: string): Promise<Location> {
    // Перевіряємо наявність локації
    await this.findById(id);

    // Оновлюємо локацію
    const updatedLocation = await this.locationsRepository.update(
      id,
      updateLocationDto,
    );

    // Оновлюємо в Elasticsearch
    await this.locationsSearchService.updateIndexedLocation(updatedLocation);

    // Публікуємо подію про оновлення локації для інших сервісів
    await this.publishLocationEvent('location.updated', updatedLocation);

    // Видаляємо кеш
    await this.invalidateLocationCache(id);

    return updatedLocation;
  }

  /**
   * Видалення локації
   */
  async delete(id: string): Promise<void> {
    // Перевіряємо наявність локації
    await this.findById(id);

    // Видаляємо локацію
    await this.locationsRepository.delete(id);

    // Видаляємо з Elasticsearch
    await this.locationsSearchService.removeIndexedLocation(id);

    // Публікуємо подію про видалення локації для інших сервісів
    await this.publishLocationEvent('location.deleted', { id });

    // Видаляємо кеш
    await this.invalidateLocationCache(id);
  }

  /**
   * Оновлення статусу локації
   */
  async updateStatus(id: string, status: string): Promise<Location> {
    // Перевіряємо наявність локації
    await this.findById(id);

    // Оновлюємо статус
    const updatedLocation = await this.locationsRepository.updateStatus(id, status);

    // Оновлюємо в Elasticsearch
    await this.locationsSearchService.updateIndexedLocation(updatedLocation);

    // Публікуємо подію про оновлення статусу локації для інших сервісів
    await this.publishLocationEvent('location.status_updated', updatedLocation);

    // Видаляємо кеш
    await this.invalidateLocationCache(id);

    return updatedLocation;
  }

  /**
   * Оновлення оцінки доступності локації
   */
  async updateAccessibilityScore(id: string, score: number): Promise<Location> {
    // Перевіряємо наявність локації
    await this.findById(id);

    // Оновлюємо оцінку
    const updatedLocation = await this.locationsRepository.updateAccessibilityScore(
      id,
      score,
    );

    // Оновлюємо в Elasticsearch
    await this.locationsSearchService.updateIndexedLocation(updatedLocation);

    // Публікуємо подію про оновлення оцінки локації для інших сервісів
    await this.publishLocationEvent('location.score_updated', updatedLocation);

    // Видаляємо кеш
    await this.invalidateLocationCache(id);

    return updatedLocation;
  }

  /**
   * Отримання локацій організації
   */
  async findByOrganization(organizationId: string): Promise<Location[]> {
    return this.locationsRepository.findByOrganization(organizationId);
  }

  /**
   * Отримання локацій, створених користувачем
   */
  async findByUser(userId: string): Promise<Location[]> {
    return this.locationsRepository.findByUser(userId);
  }

  /**
   * Видалення кешу локації
   */
  private async invalidateLocationCache(id: string): Promise<void> {
    // Видаляємо конкретні кеші для локації
    await this.redisService.del(`location:${id}:true`);
    await this.redisService.del(`location:${id}:false`);

    // Шукаємо та видаляємо всі кеші для списків локацій
    const redisClient = this.redisService.getClient();
    const keys = await redisClient.keys('locations:*');
    
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  }

  /**
   * Публікація події про локацію для інших сервісів
   */
  private async publishLocationEvent(event: string, data: any): Promise<void> {
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