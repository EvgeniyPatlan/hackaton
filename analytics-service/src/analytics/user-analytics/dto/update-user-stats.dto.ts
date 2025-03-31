import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserStatsDto {
  @ApiPropertyOptional({
    description: 'Кількість сесій для додавання',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sessionCount?: number;

  @ApiPropertyOptional({
    description: 'Час, проведений у системі (у секундах) для додавання',
    example: 300,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  timeSpent?: number;

  @ApiPropertyOptional({
    description: 'Кількість доданих локацій для додавання',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  locationsAdded?: number;

  @ApiPropertyOptional({
    description: 'Кількість відправлених відгуків для додавання',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  reviewsSubmitted?: number;

  @ApiPropertyOptional({
    description: 'Кількість виконаних пошуків для додавання',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  searchesPerformed?: number;
}
