import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    description: 'ID користувача',
    example: 'f1b45b7a-e68f-4e42-9eb5-39a3825ea97c',
  })
  id: string;

  @ApiProperty({
    description: 'Email користувача',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Повне ім\'я користувача',
    example: 'Іван Петренко',
  })
  fullName: string;

  @ApiProperty({
    description: 'Роль користувача',
    example: 'user',
  })
  role: string;

  @ApiProperty({
    description: 'Права доступу користувача',
    example: {
      locations: { create: true, read: true, update: true, delete: false },
      features: { create: true, read: true, update: true, delete: false },
      reviews: { create: true, read: true, update: true, delete: false },
    },
  })
  permissions: any;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT токен доступу',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT токен оновлення',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Інформація про користувача',
    type: UserDto,
  })
  user: UserDto;
}
