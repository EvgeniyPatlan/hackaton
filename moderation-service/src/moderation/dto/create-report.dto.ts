import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ItemType } from '@prisma/client';

export class CreateReportDto {
  @IsEnum(ItemType, { message: 'Invalid item type' })
  itemType: ItemType;

  @IsString()
  @IsNotEmpty()
  itemId: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  description?: string;
}
