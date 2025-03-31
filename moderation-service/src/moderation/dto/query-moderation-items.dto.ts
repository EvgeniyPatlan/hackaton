import { IsEnum, IsInt, IsOptional, Min, IsIn } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ItemType, ModerationStatus } from '@prisma/client';

export class QueryModerationItemsDto {
  @IsEnum(ModerationStatus, { message: 'Invalid moderation status' })
  @IsOptional()
  status?: ModerationStatus;

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
