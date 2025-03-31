import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'JWT токен оновлення',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString({ message: 'Токен оновлення повинен бути рядком' })
  @IsNotEmpty({ message: 'Токен оновлення обов\'язковий' })
  refreshToken: string;
}
