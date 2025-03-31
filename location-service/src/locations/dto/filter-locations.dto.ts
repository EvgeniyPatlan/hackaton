import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

// Типи локацій
enum LocationType {
  GOVERNMENT_BUILDING = 'government_building',
  BUSINESS = 'business',
  HEALTHCARE = 'healthcare',
  EDUCATION = 'education',
  CULTURE = 'culture',
  TRANSPORT = 'transport',
  RECREATION = 'recreation',
  OTHER = 'other',
}

// Статуси локацій
enum LocationStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PUBLISHED = 'published',
  REJECTED = 'rejected',
}

export class FilterLocationsDto {
  @ApiPropertyOptional({
    description: 'Номер сторінки для пагінації',
    default: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({
    description: 'Кількість елементів на сторінку',
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Тип локації',
    enum: LocationType,
  })
  @IsEnum(LocationType)
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({
    description: 'Категорія локації',
    example: 'cnap',
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    description: 'Мінімальна оцінка доступності (1-100)',
    minimum: 1,
    maximum: 100,
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  minAccessibilityScore?: number;

  @ApiPropertyOptional({
    description: 'Статус локації',
    enum: LocationStatus,
    default: LocationStatus.PUBLISHED,
  })
  @IsEnum(LocationStatus)
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    description: 'Чи включати елементи безбар`єрності у відповідь',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  withFeatures?: boolean;

  @ApiPropertyOptional({
    description: 'Широта для пошуку за радіусом',
    example: 50.446999,
  })
  @IsLatitude()
  @IsOptional()
  @Type(() => Number)
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Довгота для пошуку за радіусом',
    example: 30.503324,
  })
  @IsLongitude()
  @IsOptional()
  @Type(() => Number)
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Радіус пошуку в метрах',
    example: 1000,
    minimum: 100,
    maximum: 50000,
  })
  @IsNumber()
  @Min(100)
  @Max(50000)
  @IsOptional()
  @Type(() => Number)
  radius?: number;

  @ApiPropertyOptional({
    description: 'Пошуковий запит для текстового пошуку',
    example: 'центр надання',
  })
  @IsString()
  @IsOptional()
  search?: string;
}
