import { HealthCheckService, PrismaHealthIndicator, DiskHealthIndicator, MemoryHealthIndicator } from '@nestjs/terminus';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
export declare class CustomElasticsearchHealthIndicator extends HealthIndicator {
    private readonly httpService;
    private configService;
    constructor(httpService: HttpService, configService: ConfigService);
    pingCheck(key: string, options?: {
        timeout?: number;
    }): Promise<HealthIndicatorResult>;
}
export declare class HealthController {
    private readonly health;
    private readonly prismaHealth;
    private readonly diskHealth;
    private readonly memoryHealth;
    private readonly elasticsearchHealth;
    private readonly prismaService;
    private readonly httpService;
    constructor(health: HealthCheckService, prismaHealth: PrismaHealthIndicator, diskHealth: DiskHealthIndicator, memoryHealth: MemoryHealthIndicator, elasticsearchHealth: CustomElasticsearchHealthIndicator, prismaService: PrismaService, httpService: HttpService);
    check(): Promise<import("@nestjs/terminus").HealthCheckResult>;
}
