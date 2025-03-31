import {
  IsEnum,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';
import { NotificationType } from '@prisma/client';

export class UpdateTemplateDto {
  @IsEnum(NotificationType, { message: 'Invalid notification type' })
  @IsOptional()
  type?: NotificationType;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  htmlBody?: string;

  @IsString()
  @IsOptional()
  textBody?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
