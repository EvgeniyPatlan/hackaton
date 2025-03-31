import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';

export enum EventType {
  PAGE_VIEW = 'pageView',
  LOCATION_VIEW = 'locationView',
  SEARCH = 'search',
  FILTER = 'filter',
  REVIEW_SUBMIT = 'reviewSubmit',
  REGISTRATION = 'registration',
  LOGIN = 'login',
  LOGOUT = 'logout',
  PROFILE_UPDATE = 'profileUpdate',
  LOCATION_ADD = 'locationAdd',
  LOCATION_UPDATE = 'locationUpdate',
  ERROR = 'error',
}

export class CreateEventDto {
  @ApiProperty({
    description: 'Тип події',
    enum: EventType,
    example: EventType.PAGE_VIEW,
  })
  @IsEnum(EventType)
  eventType: string;

  @ApiPropertyOptional({
    description: 'ID користувача (для зареєстрованих користувачів)',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
  })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Роль користувача',
    example: 'user',
  })
  @IsString()
  @IsOptional()
  userRole?: string;

  @ApiPropertyOptional({
    description: 'Тип пристрою',
    example: 'mobile',
  })
  @IsString()
  @IsOptional()
  deviceType?: string;

  @ApiPropertyOptional({
    description: 'IP адреса (анонімізована)',
    example: '192.168.x.x',
  })
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @ApiPropertyOptional({
    description: 'User-Agent браузера',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  })
  @IsString()
  @IsOptional()
  userAgent?: string;

  @ApiPropertyOptional({
    description: 'Джерело переходу',
    example: 'https://google.com',
  })
  @IsString()
  @IsOptional()
  referrer?: string;

  @ApiPropertyOptional({
    description: 'Додаткові дані події у форматі JSON',
    example: { page: '/map', locationId: '123', query: 'ресторан' },
  })
  @IsObject()
  @IsOptional()
  data?: Record<string, any>;
}
