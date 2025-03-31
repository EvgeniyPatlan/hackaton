import { PartialType } from '@nestjs/swagger';
import { CreateLocationDto } from './create-location.dto';
import { IsOptional, IsLatitude, IsLongitude, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLocationDto extends PartialType(CreateLocationDto) {
  @ApiPropertyOptional({
    description: 'Широта (latitude)',
    example: 50.446999,
  })
  @IsNumber()
  @IsLatitude()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Довгота (longitude)',
    example: 30.503324,
  })
  @IsNumber()
  @IsLongitude()
  @IsOptional()
  longitude?: number;
}
