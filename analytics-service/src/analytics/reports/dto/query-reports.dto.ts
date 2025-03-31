import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsUUID, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ReportType } from './create-report.dto';

export class QueryReportsDto {
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
    description: 'Фільтрація за типом звіту',
    enum: ReportType,
    example: ReportType.MONTHLY,
  })
  @IsOptional()
  @IsEnum(ReportType)
  type?: string;

  @ApiPropertyOptional({
    description: 'Фільтрація за ID користувача-автора',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
  })
  @IsOptional()
  @IsUUID()
  creatorId?: string;
}
