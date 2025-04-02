import { Module } from '@nestjs/common';
import {
  TerminusModule,
  DiskHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { PrismaHealthIndicator } from './prisma.health';
import { CustomElasticsearchHealthIndicator } from './custom-elasticsearch.health';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import checkDiskSpace from 'check-disk-space';

@Module({
  imports: [TerminusModule, HttpModule, ConfigModule],
  controllers: [HealthController],
  providers: [
    {
      provide: 'CheckDiskSpaceLib',
      useValue: checkDiskSpace,
    },
    DiskHealthIndicator,
    MemoryHealthIndicator,
    PrismaHealthIndicator,
    CustomElasticsearchHealthIndicator,
    PrismaService,
  ],
})
export class HealthModule {}
