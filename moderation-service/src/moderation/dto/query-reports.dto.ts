import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ItemType, ReportStatus } from '@prisma/client';

export class QueryReportsDto {
  @IsEnum(ReportStatus, { message: 'Invalid report status' })
  @IsOptional()
  status?: ReportStatus;

  @IsEnum(ItemType, { message: 'Invalid item type' })
  @IsOptional()
  itemType?: ItemType;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}
