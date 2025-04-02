"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = exports.CustomElasticsearchHealthIndicator = void 0;
const common_1 = require("@nestjs/common");
const terminus_1 = require("@nestjs/terminus");
const axios_1 = require("@nestjs/axios");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../prisma/prisma.service");
const config_1 = require("@nestjs/config");
const common_2 = require("@nestjs/common");
const terminus_2 = require("@nestjs/terminus");
const rxjs_1 = require("rxjs");
let CustomElasticsearchHealthIndicator = class CustomElasticsearchHealthIndicator extends terminus_2.HealthIndicator {
    constructor(httpService, configService) {
        super();
        this.httpService = httpService;
        this.configService = configService;
    }
    async pingCheck(key, options = {}) {
        const timeout = options.timeout || 5000;
        const url = this.configService.get('ELASTICSEARCH_URL') || 'http://elasticsearch:9200';
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${url}/_cluster/health`, {
                timeout,
            }));
            const result = this.getStatus(key, true, { status: response.data.status });
            return result;
        }
        catch (error) {
            const result = this.getStatus(key, false, { message: error.message });
            return result;
        }
    }
};
exports.CustomElasticsearchHealthIndicator = CustomElasticsearchHealthIndicator;
exports.CustomElasticsearchHealthIndicator = CustomElasticsearchHealthIndicator = __decorate([
    (0, common_2.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService, config_1.ConfigService])
], CustomElasticsearchHealthIndicator);
let HealthController = class HealthController {
    constructor(health, prismaHealth, diskHealth, memoryHealth, elasticsearchHealth, prismaService, httpService) {
        this.health = health;
        this.prismaHealth = prismaHealth;
        this.diskHealth = diskHealth;
        this.memoryHealth = memoryHealth;
        this.elasticsearchHealth = elasticsearchHealth;
        this.prismaService = prismaService;
        this.httpService = httpService;
    }
    check() {
        return this.health.check([
            async () => {
                try {
                    await this.prismaService.$queryRaw `SELECT 1`;
                    return {
                        database: {
                            status: 'up'
                        }
                    };
                }
                catch (error) {
                    return {
                        database: {
                            status: 'down',
                            message: error.message
                        }
                    };
                }
            },
            () => this.diskHealth.checkStorage('storage', { path: '/', thresholdPercent: 0.9 }),
            () => this.memoryHealth.checkHeap('memory_heap', 300 * 1024 * 1024),
            () => this.memoryHealth.checkRSS('memory_rss', 300 * 1024 * 1024),
            () => this.elasticsearchHealth.pingCheck('elasticsearch', { timeout: 3000 }),
        ]);
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Перевірити стан сервісу' }),
    (0, common_1.Get)(),
    (0, terminus_1.HealthCheck)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "check", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('health'),
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [terminus_1.HealthCheckService,
        terminus_1.PrismaHealthIndicator,
        terminus_1.DiskHealthIndicator,
        terminus_1.MemoryHealthIndicator,
        CustomElasticsearchHealthIndicator,
        prisma_service_1.PrismaService,
        axios_1.HttpService])
], HealthController);
//# sourceMappingURL=health.controller.js.map