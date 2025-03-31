import { IsString, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DisabilityInfoDto {
  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  details?: string;

  @IsString()
  @IsOptional()
  assistiveDevices?: string;
}

export class PreferencesDto {
  @IsString()
  @IsOptional()
  accessibilityNeeds?: string;

  @IsString()
  @IsOptional()
  notificationPreferences?: string;

  @IsString()
  @IsOptional()
  language?: string;
}

export class CreateProfileDto {
  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  region?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => PreferencesDto)
  preferences?: PreferencesDto;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => DisabilityInfoDto)
  disabilityInfo?: DisabilityInfoDto;
}
