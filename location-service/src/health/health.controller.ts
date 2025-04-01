import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
  DiskHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

// Створюємо власний ElasticsearchHealthIndicator
import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CustomElasticsearchHealthIndicator extends HealthIndicator {
  constructor(private readonly httpService: HttpService, private configService: ConfigService) {
    super();
  }

  async pingCheck(key: string, options: { timeout?: number } = {}): Promise<HealthIndicatorResult> {
    const timeout = options.timeout || 5000;
    const url = this.configService.get<string>('ELASTICSEARCH_URL') || 'http://elasticsearch:9200';

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${url}/_cluster/health`, {
          timeout,
        })
      );

      const result = this.getStatus(key, true, { status: response.data.status });
      return result;
    } catch (error) {
      const result = this.getStatus(key, false, { message: error.message });
      return result;
    }
  }
}

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
      // Перевірка з'єднання з базою даних PostgreSQL
      async () => {
        try {
          await this.prismaService.$queryRaw`SELECT 1`;
          // Замість прямого виклику getStatus, повертаємо об'єкт у потрібному форматі
          return {
            database: {
              status: 'up'
            }
          };
        } catch (error) {
          return {
            database: {
              status: 'down',
              message: error.message
            }
          };
        }
      },
      
      // Перевірка диску
      () => this.diskHealth.checkStorage('storage', { path: '/', thresholdPercent: 0.9 }),
      
      // Перевірка пам'яті
      () => this.memoryHealth.checkHeap('memory_heap', 300 * 1024 * 1024), // 300MB
      () => this.memoryHealth.checkRSS('memory_rss', 300 * 1024 * 1024), // 300MB
      
      // Перевірка Elasticsearch з власним індикатором
      () => this.elasticsearchHealth.pingCheck('elasticsearch', { timeout: 3000 }),
    ]);
  }
}