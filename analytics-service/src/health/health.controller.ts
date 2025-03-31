import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  PrismaHealthIndicator,
  DiskHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Перевірка з'єднання з базою даних
      async () => this.prismaHealth.pingCheck('database', this.prisma),
      
      // Перевірка використання диску
      async () => this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.9 }),
      
      // Перевірка використання пам'яті
      async () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
      
      // Перевірка з'єднання з Redis
      async () => {
        try {
          await this.redis.getClient().ping();
          return { redis: { status: 'up' } };
        } catch (error) {
          return { redis: { status: 'down', message: error.message } };
        }
      },
    ]);
  }
}
