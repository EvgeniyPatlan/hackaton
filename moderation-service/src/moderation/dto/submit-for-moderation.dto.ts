import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ItemType } from '@prisma/client';

export class SubmitForModerationDto {
  @IsEnum(ItemType, { message: 'Invalid item type' })
  itemType: ItemType;

  @IsString()
  @IsNotEmpty()
  itemId: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
