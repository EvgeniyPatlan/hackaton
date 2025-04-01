import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';
import { LocationsRepository } from './locations.repository';
import { LocationsSearchService } from './locations-search.service';

@Module({
  imports: [
    ElasticsearchModule.register({  // Змінено з forRoot на register
      node: process.env.ELASTICSEARCH_URL || 'http://elasticsearch:9200',
    }),
  ],
  controllers: [LocationsController],
  providers: [LocationsService, LocationsRepository, LocationsSearchService],
  exports: [LocationsService, LocationsRepository, LocationsSearchService],
})
export class LocationsModule {}