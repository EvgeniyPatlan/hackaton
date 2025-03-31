import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Email користувача',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Введіть правильний email' })
  @IsNotEmpty({ message: 'Email обов\'язковий' })
  email: string;

  @ApiProperty({
    description: 'Пароль користувача',
    example: 'password123',
    minLength: 8,
  })
  @IsString({ message: 'Пароль повинен бути рядком' })
  @IsNotEmpty({ message: 'Пароль обов\'язковий' })
  @MinLength(8, { message: 'Пароль повинен бути не менше 8 символів' })
  password: string;
}
