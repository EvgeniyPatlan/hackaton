import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsArray,
  IsEnum,
  ArrayUnique,
  IsPhoneNumber,
} from 'class-validator';
import { NotificationType } from '@prisma/client';

export class UpdatePreferenceDto {
  @IsBoolean()
  @IsOptional()
  emailEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  pushEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  smsEnabled?: boolean;

  @IsEmail()
  @IsOptional()
  emailAddress?: string;

  @IsPhoneNumber()
  @IsOptional()
  phoneNumber?: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  @IsOptional()
  deviceTokens?: string[];

  @IsArray()
  @IsEnum(NotificationType, { each: true })
  @ArrayUnique()
  @IsOptional()
  categories?: NotificationType[];
}
