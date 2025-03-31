import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { v4 as uuidv4 } from 'uuid';

// Додаємо інтерфейси для типів
interface UserWithRole {
  id: string;
  email: string;
  role: {
    name: string;
  };
}

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  exp?: number;
}

interface RefreshTokenEntity {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
}

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async generateTokens(user: UserWithRole) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '1h'),
      secret: this.configService.get<string>('JWT_SECRET'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      secret: this.configService.get<string>('JWT_SECRET'),
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    // Обчислюємо час закінчення дії токену
    const decoded = this.jwtService.decode(refreshToken) as JwtPayload;
    // Додаємо перевірку на undefined для exp з резервним значенням
    const expTime = decoded.exp || Math.floor(Date.now() / 1000) + 604800; // 7 днів у секундах
    const expiresAt = new Date(expTime * 1000); // JWT exp у секундах, перетворюємо на мілісекунди

    // Зберігаємо токен у БД
    await this.prisma.refreshToken.create({
      data: {
        id: uuidv4(),
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    // Також кешуємо токен у Redis для швидкої перевірки
    const redisKey = `refresh_token:${refreshToken}`;
    await this.redisService.set(redisKey, userId, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
  }

  async verifyRefreshToken(refreshToken: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      }) as JwtPayload;
    } catch (error) {
      this.logger.error(`Error verifying refresh token: ${error.message}`);
      throw error;
    }
  }

  async findRefreshToken(refreshToken: string): Promise<boolean> {
    // Спочатку перевіряємо у Redis
    const redisKey = `refresh_token:${refreshToken}`;
    const cachedUserId = await this.redisService.get(redisKey);
    
    if (cachedUserId) {
      return true;
    }

    // Якщо не знайдено у Redis, перевіряємо у БД
    const token = await this.prisma.refreshToken.findFirst({
      where: { token: refreshToken },
    });

    return !!token;
  }

  async removeRefreshToken(refreshToken: string): Promise<void> {
    // Видаляємо з Redis
    const redisKey = `refresh_token:${refreshToken}`;
    await this.redisService.del(redisKey);

    // Видаляємо з БД
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  async removeAllUserTokens(userId: string): Promise<void> {
    // Отримуємо всі токени користувача
    const tokens = await this.prisma.refreshToken.findMany({
      where: { userId },
    });

    // Видаляємо з Redis
    await Promise.all(
      tokens.map(async (token: RefreshTokenEntity) => {
        const redisKey = `refresh_token:${token.token}`;
        return this.redisService.del(redisKey);
      }),
    );

    // Видаляємо з БД
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }
}