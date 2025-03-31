import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    // Конфігурація середовища
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    
    // Планувальник для регулярних задач
    ScheduleModule.forRoot(),
    
    // Prisma для роботи з БД
    PrismaModule,
    
    // Модуль аналітики
    AnalyticsModule,
    
    // Перевірка стану сервісу
    HealthModule,
    
    // Redis для кешування і розподілених обчислень
    RedisModule,
  ],
})
export class AppModule {}
