import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { LocationsModule } from './locations/locations.module';
import { FeaturesModule } from './features/features.module';
import { ReviewsModule } from './reviews/reviews.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // Конфігурація з .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // Захист від спама та брутфорсу
    ThrottlerModule.forRoot({
      throttlers: [{
        ttl: 60, // 1 хвилина
        limit: 20, // 20 запитів
      }]
    }),
    
    // Health check
    TerminusModule,
    HttpModule,
    
    // Elasticsearch для пошуку
    ElasticsearchModule.register({  // Змінено forRoot на register
      node: process.env.ELASTICSEARCH_URL || 'http://elasticsearch:9200',
    }),
    
    // Основні модулі
    PrismaModule,
    RedisModule,
    LocationsModule,
    FeaturesModule,
    ReviewsModule,
    HealthModule,
  ],
})
export class AppModule {}