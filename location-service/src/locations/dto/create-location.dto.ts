import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsObject,
  IsUUID,
  Min,
  Max,
  ValidateNested,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

// Контакти локації
class ContactsDto {
  @ApiPropertyOptional({
    description: 'Телефон локації',
    example: '+380445555555',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Email локації',
    example: 'info@example.com',
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Веб-сайт локації',
    example: 'https://example.com',
  })
  @IsString()
  @IsOptional()
  website?: string;
}

// Години роботи локації
class WorkingHoursDto {
  @ApiPropertyOptional({
    description: 'Години роботи у будні дні',
    example: '9:00-18:00',
  })
  @IsString()
  @IsOptional()
  weekdays?: string;

  @ApiPropertyOptional({
    description: 'Години роботи у суботу',
    example: '10:00-16:00',
  })
  @IsString()
  @IsOptional()
  saturday?: string;

  @ApiPropertyOptional({
    description: 'Години роботи у неділю',
    example: 'closed',
  })
  @IsString()
  @IsOptional()
  sunday?: string;
}

export class CreateLocationDto {
  @ApiProperty({
    description: 'Назва локації',
    example: 'ЦНАП Шевченківського району',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Адреса локації',
    example: 'м. Київ, бульвар Тараса Шевченка, 26/4',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'Широта (latitude)',
    example: 50.446999,
  })
  @IsNumber()
  @IsLatitude()
  latitude: number;

  @ApiProperty({
    description: 'Довгота (longitude)',
    example: 30.503324,
  })
  @IsNumber()
  @IsLongitude()
  longitude: number;

  @ApiProperty({
    description: 'Тип локації',
    enum: LocationType,
    example: LocationType.GOVERNMENT_BUILDING,
  })
  @IsEnum(LocationType)
  @IsNotEmpty()
  type: string;

  @ApiPropertyOptional({
    description: 'Категорія локації',
    example: 'cnap',
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    description: 'Опис локації',
    example: 'Центр надання адміністративних послуг Шевченківського району',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Контактна інформація',
    type: ContactsDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => ContactsDto)
  @IsOptional()
  contacts?: ContactsDto;

  @ApiPropertyOptional({
    description: 'Години роботи',
    type: WorkingHoursDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => WorkingHoursDto)
  @IsOptional()
  workingHours?: WorkingHoursDto;

  @ApiPropertyOptional({
    description: 'ID організації, якій належить локація',
    example: '2a4e62b8-cb61-4b05-90b3-8b6864ecf0aa',
  })
  @IsUUID()
  @IsOptional()
  organizationId?: string;

  @ApiPropertyOptional({
    description: 'Статус локації',
    enum: LocationStatus,
    example: LocationStatus.DRAFT,
    default: LocationStatus.DRAFT,
  })
  @IsEnum(LocationStatus)
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    description: 'Загальна оцінка доступності (1-100)',
    example: 85,
    minimum: 1,
    maximum: 100,
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  overallAccessibilityScore?: number;
}
