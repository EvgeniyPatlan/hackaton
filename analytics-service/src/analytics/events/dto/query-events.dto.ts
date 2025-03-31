import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsDateString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { EventType } from './create-event.dto';

export class QueryEventsDto {
  @ApiPropertyOptional({
    description: 'Кількість записів, які потрібно пропустити',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number = 0;

  @ApiPropertyOptional({
    description: 'Кількість записів, які потрібно отримати',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  take?: number = 10;

  @ApiPropertyOptional({
    description: 'Поле для сортування',
    example: 'timestamp',
    enum: ['timestamp', 'eventType'],
  })
  @IsOptional()
  @IsEnum(['timestamp', 'eventType'])
  orderBy?: string = 'timestamp';

  @ApiPropertyOptional({
    description: 'Початкова дата для фільтрації (ISO 8601)',
    example: '2023-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Кінцева дата для фільтрації (ISO 8601)',
    example: '2023-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Фільтрація за типом події',
    enum: EventType,
    example: EventType.PAGE_VIEW,
  })
  @IsOptional()
  @IsEnum(EventType)
  eventType?: string;

  @ApiPropertyOptional({
    description: 'Фільтрація за ID користувача',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
  })
  @IsOptional()
  @IsString()
  userId?: string;
}
