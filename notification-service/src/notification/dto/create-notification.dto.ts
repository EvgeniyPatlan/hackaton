import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsObject,
  IsUUID,
} from 'class-validator';
import { NotificationType, Channel } from '@prisma/client';

export class CreateNotificationDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsEnum(NotificationType, { message: 'Invalid notification type' })
  type: NotificationType;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsArray()
  @IsOptional()
  @IsEnum(Channel, { each: true, message: 'Invalid channel' })
  channels: Channel[] = [Channel.IN_APP];

  @IsString()
  @IsOptional()
  templateName?: string;

  @IsObject()
  @IsOptional()
  templateData?: Record<string, any>;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
