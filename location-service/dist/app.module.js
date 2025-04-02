"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const terminus_1 = require("@nestjs/terminus");
const axios_1 = require("@nestjs/axios");
const elasticsearch_1 = require("@nestjs/elasticsearch");
const prisma_module_1 = require("./prisma/prisma.module");
const redis_module_1 = require("./redis/redis.module");
const locations_module_1 = require("./locations/locations.module");
const features_module_1 = require("./features/features.module");
const reviews_module_1 = require("./reviews/reviews.module");
const health_module_1 = require("./health/health.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            throttler_1.ThrottlerModule.forRoot({
                throttlers: [{
                        ttl: 60,
                        limit: 20,
                    }]
            }),
            terminus_1.TerminusModule,
            axios_1.HttpModule,
            elasticsearch_1.ElasticsearchModule.register({
                node: process.env.ELASTICSEARCH_URL || 'http://elasticsearch:9200',
            }),
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
            locations_module_1.LocationsModule,
            features_module_1.FeaturesModule,
            reviews_module_1.ReviewsModule,
            health_module_1.HealthModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map