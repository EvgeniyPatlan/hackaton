import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Email користувача',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Введіть правильний email' })
  @IsNotEmpty({ message: 'Email обов\'язковий' })
  email: string;

  @ApiProperty({
    description: 'Повне ім\'я користувача',
    example: 'Іван Петренко',
  })
  @IsString({ message: 'Ім\'я повинно бути рядком' })
  @IsNotEmpty({ message: 'Ім\'я обов\'язкове' })
  fullName: string;

  @ApiPropertyOptional({
    description: 'Номер телефону користувача',
    example: '+380991234567',
  })
  @IsOptional()
  @Matches(/^\+?[0-9]{10,15}$/, { message: 'Невірний формат номера телефону' })
  phone?: string;

  @ApiProperty({
    description: 'Пароль користувача',
    example: 'Password123!',
    minLength: 8,
  })
  @IsString({ message: 'Пароль повинен бути рядком' })
  @IsNotEmpty({ message: 'Пароль обов\'язковий' })
  @MinLength(8, { message: 'Пароль повинен бути не менше 8 символів' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Пароль повинен містити хоча б 1 велику літеру, 1 малу літеру та 1 цифру або спеціальний символ',
  })
  password: string;
}
