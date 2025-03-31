import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';

import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // Конфігурація з .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // Захист від спама та брутфорсу
// Захист від спама та брутфорсу
ThrottlerModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService): ThrottlerModuleOptions => ({
    throttlers: [
      {
        ttl: configService.get<number>('THROTTLE_TTL', 60), // 1 хвилина
        limit: configService.get<number>('THROTTLE_LIMIT', 10), // 10 запитів
      }
    ],
  }),
}),
    
    // JWT для токенів
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h'),
        },
      }),
    }),
    
    // Passport для стратегій аутентифікації
    PassportModule.register({ defaultStrategy: 'jwt' }),
    
    // Health check
    TerminusModule,
    HttpModule,
    
    // Основні модулі
    PrismaModule,
    RedisModule,
    AuthModule,
    HealthModule,
  ],
})
export class AppModule {}