import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  DiskHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CustomElasticsearchHealthIndicator } from './custom-elasticsearch.health';
import { PrismaHealthIndicator } from './prisma.health';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly diskHealth: DiskHealthIndicator,
    private readonly memoryHealth: MemoryHealthIndicator,
    private readonly elasticsearchHealth: CustomElasticsearchHealthIndicator,
    private readonly prismaService: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  @ApiOperation({ summary: 'Перевірити стан сервісу' })
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // PostgreSQL database check
      async () => {
        try {
          await this.prismaService.$queryRaw`SELECT 1`;
          return { database: { status: 'up' } };
        } catch (error) {
          return { database: { status: 'down', message: error.message } };
        }
      },
      // Disk check
      () => this.diskHealth.checkStorage('storage', { path: '/', thresholdPercent: 0.9 }),
      // Memory heap check (300MB)
      () => this.memoryHealth.checkHeap('memory_heap', 300 * 1024 * 1024),
      // Memory RSS check (300MB)
      () => this.memoryHealth.checkRSS('memory_rss', 300 * 1024 * 1024),
      // Elasticsearch check
      () => this.elasticsearchHealth.pingCheck('elasticsearch', { timeout: 3000 }),
    ]);
  }
}
