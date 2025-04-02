import { HealthCheckService, PrismaHealthIndicator, DiskHealthIndicator, MemoryHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
export declare class HealthController {
    private readonly health;
    private readonly prismaHealth;
    private readonly diskHealth;
    private readonly memoryHealth;
    private readonly prismaService;
    constructor(health: HealthCheckService, prismaHealth: PrismaHealthIndicator, diskHealth: DiskHealthIndicator, memoryHealth: MemoryHealthIndicator, prismaService: PrismaService);
    check(): Promise<import("@nestjs/terminus").HealthCheckResult>;
}
