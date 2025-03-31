import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ModerationStatus } from '@prisma/client';

export class ModerateItemDto {
  @IsEnum(ModerationStatus, { message: 'Invalid moderation status' })
  status: ModerationStatus;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
