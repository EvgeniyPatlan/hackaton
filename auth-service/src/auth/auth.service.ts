import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from './token.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import * as bcrypt from 'bcrypt';

// Оголошення типів для покращення типізації
interface UserWithRole {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  isActive: boolean;
  lastLoginAt?: Date;
  phone?: string;
  verificationStatus?: string;
  role: {
    id: string;
    name: string;
    permissions: any;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.$queryRaw<UserWithRole[]>`
      SELECT u.*, r.* 
      FROM "users" u
      JOIN "roles" r ON u."role_id" = r.id
      WHERE u.email = ${email}
      LIMIT 1
    `;

    if (!user || user.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userFound = user[0];

    if (!userFound.isActive) {
      throw new UnauthorizedException('User account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(password, userFound.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Виключаємо пароль з результату
    const { passwordHash, ...result } = userFound;
    return result;
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    // Оновлюємо час останнього входу
    await this.prisma.$executeRaw`
      UPDATE "users" 
      SET "last_login_at" = NOW() 
      WHERE id = ${user.id}
    `;

    // Створюємо токени
    const { accessToken, refreshToken } = await this.tokenService.generateTokens(user);

    // Зберігаємо refresh token в БД
    await this.tokenService.saveRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role.name,
        permissions: user.role.permissions,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Перевіряємо, чи існує користувач з таким email
    const existingUsers = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM "users" WHERE email = ${registerDto.email} LIMIT 1
    `;

    if (existingUsers && existingUsers.length > 0) {
      throw new BadRequestException('User with this email already exists');
    }

    // Хешуємо пароль
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(registerDto.password, saltRounds);

    // Отримуємо роль користувача (за замовчуванням 'user')
    const roles = await this.prisma.$queryRaw<any[]>`
      SELECT id, name, permissions FROM "roles" WHERE name = 'user' LIMIT 1
    `;

    if (!roles || roles.length === 0) {
      throw new BadRequestException('Default role not found');
    }

    const role = roles[0];

    // Створюємо нового користувача
    const newUser = await this.prisma.$transaction(async (prisma) => {
      const user = await prisma.$executeRaw`
        INSERT INTO "users" (
          id, email, password_hash, full_name, phone, role_id, verification_status, created_at, updated_at, is_active
        ) VALUES (
          gen_random_uuid(), ${registerDto.email}, ${passwordHash}, ${registerDto.fullName}, 
          ${registerDto.phone}, ${role.id}, 'unverified', NOW(), NOW(), true
        )
        RETURNING id, email, full_name, verification_status, role_id
      `;

      // Отримуємо створеного користувача
      const createdUsers = await prisma.$queryRaw<UserWithRole[]>`
        SELECT u.*, r.* 
        FROM "users" u
        JOIN "roles" r ON u."role_id" = r.id
        WHERE u.email = ${registerDto.email}
        LIMIT 1
      `;

      return createdUsers[0];
    });

    // Створюємо токени
    const { accessToken, refreshToken } = await this.tokenService.generateTokens({
      id: newUser.id,
      email: newUser.email,
      role: {
        name: role.name
      }
    });

    // Зберігаємо refresh token в БД
    await this.tokenService.saveRefreshToken(newUser.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: role.name,
        permissions: role.permissions,
      },
    };
  }

  async logout(userId: string): Promise<void> {
    // Видаляємо всі refresh токени користувача
    await this.tokenService.removeAllUserTokens(userId);
  }

  async refreshTokens(refreshToken: string): Promise<AuthResponseDto> {
    try {
      // Перевіряємо та декодуємо refresh token
      const decoded = await this.tokenService.verifyRefreshToken(refreshToken);
      
      // Перевіряємо, чи існує токен в БД
      const tokenExists = await this.tokenService.findRefreshToken(refreshToken);
      if (!tokenExists) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Отримуємо користувача
      const users = await this.prisma.$queryRaw<UserWithRole[]>`
        SELECT u.*, r.* 
        FROM "users" u
        JOIN "roles" r ON u."role_id" = r.id
        WHERE u.id = ${decoded.sub}
        LIMIT 1
      `;

      if (!users || users.length === 0 || !users[0].isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      const user = users[0];

      // Видаляємо старий refresh token
      await this.tokenService.removeRefreshToken(refreshToken);

      // Створюємо нові токени
      const tokens = await this.tokenService.generateTokens({
        id: user.id,
        email: user.email,
        role: {
          name: user.role.name
        }
      });

      // Зберігаємо новий refresh token
      await this.tokenService.saveRefreshToken(user.id, tokens.refreshToken);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role.name,
          permissions: user.role.permissions,
        },
      };
    } catch (error) {
      this.logger.error(`Error refreshing tokens: ${error.message}`);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}