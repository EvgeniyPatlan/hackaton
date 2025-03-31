import { IsString, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { DisabilityInfoDto, PreferencesDto } from './create-profile.dto';
import { Type } from 'class-transformer';

export class UpdateProfileDto {
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
