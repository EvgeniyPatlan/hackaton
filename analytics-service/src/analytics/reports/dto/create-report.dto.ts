import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsEnum, IsBoolean } from 'class-validator';

export enum ReportType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
}

export class CreateReportDto {
  @ApiProperty({
    description: 'Назва звіту',
    example: 'Популярні локації за місяць',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Опис звіту',
    example: 'Аналіз найбільш популярних локацій за переглядами за останній місяць',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Тип звіту',
    enum: ReportType,
    example: ReportType.MONTHLY,
  })
  @IsEnum(ReportType)
  type: string;

  @ApiProperty({
    description: 'Параметри запиту для звіту',
    example: {
      query: 'SELECT l."id", l."name", COUNT(*) as view_count FROM "AnalyticsEvent" ae JOIN "Location" l ON ae.data->>\'locationId\' = l."id"::text WHERE ae."eventType" = \'locationView\' AND ae."timestamp" >= $1 AND ae."timestamp" <= $2 GROUP BY l."id", l."name" ORDER BY view_count DESC LIMIT 10',
      parameters: [],
      startDate: '2023-01-01',
      endDate: '2023-01-31',
    },
  })
  @IsObject()
  query: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Розклад для автоматичної генерації (cron вираз)',
    example: '0 3 * * *',
  })
  @IsString()
  @IsOptional()
  schedule?: string;

  @ApiPropertyOptional({
    description: 'Чи активний звіт',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}
