import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

export class CreateFeatureDto {
  @ApiProperty({
    description: 'Тип елементу безбар\'єрності',
    enum: FeatureType,
    example: FeatureType.RAMP,
  })
  @IsEnum(FeatureType)
  @IsNotEmpty()
  type: string;

  @ApiPropertyOptional({
    description: 'Підтип елементу безбар\'єрності',
    example: 'permanent',
  })
  @IsString()
  @IsOptional()
  subtype?: string;

  @ApiPropertyOptional({
    description: 'Опис елементу безбар\'єрності',
    example: 'Пандус при вході до будівлі',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Статус наявності елементу (true - наявний, false - відсутній)',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  status: boolean;

  @ApiPropertyOptional({
    description: 'Оцінка якості елементу (1-5)',
    minimum: 1,
    maximum: 5,
    example: 4,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  qualityRating?: number;

  @ApiPropertyOptional({
    description: 'Відповідність стандартам (ДБН)',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  standardsCompliance?: boolean;
}
