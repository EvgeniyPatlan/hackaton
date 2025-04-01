import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Створюємо інтерфейси для DTO замість імпорту неіснуючих файлів
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

// Замість імпорту з @prisma/client
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

@Injectable()
export class ReviewsRepository {
  private readonly logger = new Logger(ReviewsRepository.name);

  constructor(private prisma: PrismaService) {}

  async findAllByLocation(
    locationId: string,
    filterDto: FilterReviewsDto,
  ) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = filterDto;
    const skip = (page - 1) * limit;

    // Перевіряємо, чи існує локація
    const location = await this.prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      throw new NotFoundException(`Location with ID "${locationId}" not found`);
    }

    // Створюємо фільтр для статусу модерації
    // За замовчуванням показуємо лише схвалені відгуки
    const moderationStatus = filterDto.moderationStatus || 'approved';
    
    // Знаходимо всі відгуки для локації
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

  async findById(id: string): Promise<Review> {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID "${id}" not found`);
    }

    return review;
  }

  async create(
    locationId: string,
    createReviewDto: CreateReviewDto,
    userId: string,
  ): Promise<Review> {
    // Перевіряємо, чи існує локація
    const location = await this.prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      throw new NotFoundException(`Location with ID "${locationId}" not found`);
    }

    // Перевіряємо, чи користувач вже залишав відгук для цієї локації
    const existingReview = await this.prisma.review.findFirst({
      where: {
        locationId,
        userId,
      },
    });

    if (existingReview) {
      // Якщо існує, оновлюємо його
      return this.prisma.review.update({
        where: { id: existingReview.id },
        data: {
          ...createReviewDto,
          moderationStatus: 'pending', // Новий відгук потребує модерації
          updatedAt: new Date(),
        },
      });
    }

    // Інакше створюємо новий відгук
    return this.prisma.review.create({
      data: {
        ...createReviewDto,
        locationId,
        userId,
        moderationStatus: 'pending', // Новий відгук потребує модерації
      },
    });
  }

  async update(
    id: string,
    updateReviewDto: UpdateReviewDto,
  ): Promise<Review> {
    // Перевіряємо, чи існує відгук
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID "${id}" not found`);
    }

    // Оновлюємо відгук
    return this.prisma.review.update({
      where: { id },
      data: {
        ...updateReviewDto,
        moderationStatus: 'pending', // Зміни потребують нової модерації
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<void> {
    // Перевіряємо, чи існує відгук
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID "${id}" not found`);
    }

    // Видаляємо відгук
    await this.prisma.review.delete({
      where: { id },
    });
  }

  async updateModerationStatus(
    id: string,
    status: string,
  ): Promise<Review> {
    // Перевіряємо, чи існує відгук
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID "${id}" not found`);
    }

    // Оновлюємо статус модерації
    return this.prisma.review.update({
      where: { id },
      data: {
        moderationStatus: status,
        updatedAt: new Date(),
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async calculateAverageRating(locationId: string): Promise<number> {
    // Знаходимо всі схвалені відгуки для локації
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

    // Обчислюємо середню оцінку
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / reviews.length;
  }
}