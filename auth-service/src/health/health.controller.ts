import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
  DiskHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly diskHealth: DiskHealthIndicator,
    private readonly memoryHealth: MemoryHealthIndicator,
    private readonly prismaService: PrismaService,
  ) {}

  @ApiOperation({ summary: 'Перевірити стан сервісу' })
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Перевірка з'єднання з базою даних PostgreSQL
      () => this.prismaHealth.pingCheck('database', this.prismaService),
      
      // Перевірка диску
      () => this.diskHealth.checkStorage('storage', { path: '/', thresholdPercent: 0.9 }),
      
      // Перевірка пам'яті
      () => this.memoryHealth.checkHeap('memory_heap', 300 * 1024 * 1024), // 300MB
      () => this.memoryHealth.checkRSS('memory_rss', 300 * 1024 * 1024), // 300MB
    ]);
  }
}
