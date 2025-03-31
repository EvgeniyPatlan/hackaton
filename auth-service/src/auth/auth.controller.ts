import {
  Controller,
  Post,
  Body,
  HttpCode,
  UseGuards,
  Request,
  Get,
  UnauthorizedException, // Додав імпорт
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

// Додаємо інтерфейс для типізації користувача
interface RequestUser {
  id: string;
  [key: string]: any;
}

// Розширюємо інтерфейс ExpressRequest
interface RequestWithUser extends ExpressRequest {
  user?: RequestUser;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Увійти в систему' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Успішний вхід',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Невірні облікові дані' })
  @UseGuards(AuthGuard('local'))
  @HttpCode(200)
  @Post('login')
  async login(@Request() req: RequestWithUser, @Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: 'Зареєструватися в системі' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Успішна реєстрація',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Користувач з таким email вже існує' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: 'Вийти з системи' })
  @ApiResponse({ status: 200, description: 'Успішний вихід' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  @Post('logout')
  async logout(@Request() req: RequestWithUser): Promise<{ message: string }> {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not authenticated');
    }
    await this.authService.logout(req.user.id);
    return { message: 'Logged out successfully' };
  }

  @ApiOperation({ summary: 'Оновити токени' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Токени успішно оновлено',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Невірний refresh token' })
  @HttpCode(200)
  @Post('refresh')
  async refreshTokens(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @ApiOperation({ summary: 'Отримати інформацію про поточного користувача' })
  @ApiResponse({
    status: 200,
    description: 'Успішно отримано інформацію',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getProfile(@Request() req: RequestWithUser): Promise<any> {
    return req.user;
  }
}