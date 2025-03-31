import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private readonly prismaService: PrismaService,
    private disk: DiskHealthIndicator,
    private configService: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Database connection check
      async () =>
        this.prismaHealth.pingCheck('database', () =>
          this.prismaService.$queryRaw`SELECT 1`,
        ),
      
      // Disk storage check - ensure we have enough storage for uploads
      () => {
        const uploadDir = this.configService.get<string>('UPLOAD_DIR') || 'uploads';
        return this.disk.checkStorage('storage', { 
          path: uploadDir, 
          thresholdPercent: 0.9, // 90% threshold 
        });
      },
    ]);
  }
}
