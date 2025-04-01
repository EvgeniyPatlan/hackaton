import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  HealthIndicator,
  HealthIndicatorResult,
  DiskHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

class PrismaHealthIndicator extends HealthIndicator {
  constructor(private prisma: PrismaService) {
    super();
  }

  async pingCheck(key: string): Promise<HealthIndicatorResult> {
    try {
      // Виконуємо найпростіший запит до бази даних
      await this.prisma.$queryRaw`SELECT 1`;
      return this.getStatus(key, true);
    } catch (error) {
      return this.getStatus(key, false, { message: error.message });
    }
  }
}

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prisma: PrismaService,
    private disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
    private redis: RedisService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    const prismaHealthIndicator = new PrismaHealthIndicator(this.prisma);

    return this.health.check([
      // Перевірка з'єднання з базою даних
      async () => prismaHealthIndicator.pingCheck('database'),
      
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