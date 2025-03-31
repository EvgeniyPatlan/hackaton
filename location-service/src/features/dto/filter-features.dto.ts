import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

// Типи елементів безбар'єрності
enum FeatureType {
  RAMP = 'ramp',
  ELEVATOR = 'elevator',
  CALL_BUTTON = 'call_button',
  TACTILE_PATH = 'tactile_path',
  ACCESSIBLE_TOILET = 'accessible_toilet',
  PARKING = 'parking',
  ENTRANCE = 'entrance',
  INTERIOR = 'interior',
  SIGNAGE = 'signage',
  OTHER = 'other',
}

export class FilterFeaturesDto {
  @ApiPropertyOptional({
    description: 'Тип елементу безбар\'єрності',
    enum: FeatureType,
  })
  @IsEnum(FeatureType)
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({
    description: 'Підтип елементу безбар\'єрності',
    example: 'permanent',
  })
  @IsString()
  @IsOptional()
  subtype?: string;

  @ApiPropertyOptional({
    description: 'Статус наявності елементу (true - наявний, false - відсутній)',
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  status?: boolean;
}
