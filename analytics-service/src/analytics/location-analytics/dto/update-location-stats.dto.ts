import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateLocationStatsDto {
  @ApiPropertyOptional({
    description: 'Кількість переглядів для додавання',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  viewCount?: number;

  @ApiPropertyOptional({
    description: 'Кількість відгуків для додавання',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  reviewCount?: number;

  @ApiPropertyOptional({
    description: 'Середній рейтинг (від 0 до 5)',
    example: 4.5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  avgRating?: number;
}
