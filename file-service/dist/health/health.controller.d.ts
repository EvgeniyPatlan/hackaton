import { HealthCheckService, PrismaHealthIndicator, DiskHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
export declare class HealthController {
    private health;
    private prismaHealth;
    private readonly prismaService;
    private disk;
    private configService;
    constructor(health: HealthCheckService, prismaHealth: PrismaHealthIndicator, prismaService: PrismaService, disk: DiskHealthIndicator, configService: ConfigService);
    check(): Promise<import("@nestjs/terminus").HealthCheckResult>;
}
