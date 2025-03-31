import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Location } from '@prisma/client';
import { SearchResponse } from '@elastic/elasticsearch/lib/api/types';

interface LocationSearchBody {
  id: string;
  name: string;
  address: string;
  type: string;
  category?: string;
  description?: string;
  overallAccessibilityScore?: number;
  coordinates: {
    lat: number;
    lon: number;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class LocationsSearchService {
  private readonly logger = new Logger(LocationsSearchService.name);
  private readonly index = 'locations';

  constructor(private readonly elasticsearchService: ElasticsearchService) {
    this.createIndex();
  }

  /**
   * Створення індексу, якщо він не існує
   */
  private async createIndex() {
    try {
      const indexExists = await this.elasticsearchService.indices.exists({
        index: this.index,
      });

      if (!indexExists) {
        await this.elasticsearchService.indices.create({
          index: this.index,
          body: {
            mappings: {
              properties: {
                id: { type: 'keyword' },
                name: { type: 'text', analyzer: 'standard' },
                address: { type: 'text', analyzer: 'standard' },
                type: { type: 'keyword' },
                category: { type: 'keyword' },
                description: { type: 'text', analyzer: 'standard' },
                overallAccessibilityScore: { type: 'integer' },
                coordinates: { type: 'geo_point' },
                status: { type: 'keyword' },
                createdAt: { type: 'date' },
                updatedAt: { type: 'date' },
              },
            },
          },
        });

        this.logger.log(`Created index: ${this.index}`);
      }
    } catch (error) {
      this.logger.error(`Error creating index: ${error.message}`);
    }
  }

  /**
   * Індексація локації в Elasticsearch
   */
  async indexLocation(location: any) {
    try {
      // Отримуємо координати з PostGIS формату
      const coordinates = location.coordinates 
        ? this.extractCoordinates(location.coordinates) 
        : null;

      const document: LocationSearchBody = {
        id: location.id,
        name: location.name,
        address: location.address,
        type: location.type,
        category: location.category,
        description: location.description,
        overallAccessibilityScore: location.overallAccessibilityScore,
        coordinates: coordinates 
          ? { lat: coordinates.latitude, lon: coordinates.longitude } 
          : undefined,
        status: location.status,
        createdAt: location.createdAt.toISOString(),
        updatedAt: location.updatedAt.toISOString(),
      };

      await this.elasticsearchService.index({
        index: this.index,
        id: document.id,
        document,
      });

      this.logger.log(`Indexed location: ${document.id}`);
    } catch (error) {
      this.logger.error(`Error indexing location: ${error.message}`);
    }
  }

  /**
   * Оновлення індексованої локації
   */
  async updateIndexedLocation(location: any) {
    try {
      // Перевіряємо, чи існує документ у індексі
      const exists = await this.elasticsearchService.exists({
        index: this.index,
        id: location.id,
      });

      if (exists) {
        // Якщо існує, оновлюємо
        await this.elasticsearchService.update({
          index: this.index,
          id: location.id,
          doc: {
            name: location.name,
            address: location.address,
            type: location.type,
            category: location.category,
            description: location.description,
            overallAccessibilityScore: location.overallAccessibilityScore,
            status: location.status,
            updatedAt: location.updatedAt.toISOString(),
          },
        });

        this.logger.log(`Updated indexed location: ${location.id}`);
      } else {
        // Якщо не існує, індексуємо заново
        await this.indexLocation(location);
      }
    } catch (error) {
      this.logger.error(`Error updating indexed location: ${error.message}`);
    }
  }

  /**
   * Видалення локації з індексу
   */
  async removeIndexedLocation(locationId: string) {
    try {
      await this.elasticsearchService.delete({
        index: this.index,
        id: locationId,
      });

      this.logger.log(`Removed indexed location: ${locationId}`);
    } catch (error) {
      this.logger.error(`Error removing indexed location: ${error.message}`);
    }
  }

  /**
   * Пошук локацій за текстом
   */
  async search(text: string, page = 1, limit = 10) {
    const from = (page - 1) * limit;

    try {
      const { hits } = await this.elasticsearchService.search<LocationSearchBody>({
        index: this.index,
        from,
        size: limit,
        query: {
          bool: {
            should: [
              {
                multi_match: {
                  query: text,
                  fields: ['name^3', 'address^2', 'description'],
                  fuzziness: 'AUTO',
                },
              },
            ],
            filter: [
              {
                term: {
                  status: 'published',
                },
              },
            ],
          },
        },
        sort: [{ _score: { order: 'desc' } }],
      });

      const count = hits.total as { value: number };
      const results = hits.hits.map((hit) => ({
        id: hit._source.id,
        name: hit._source.name,
        address: hit._source.address,
        type: hit._source.type,
        category: hit._source.category,
        overallAccessibilityScore: hit._source.overallAccessibilityScore,
        coordinates: hit._source.coordinates,
        score: hit._score,
      }));

      return {
        data: results,
        meta: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems: count.value,
          totalPages: Math.ceil(count.value / limit),
        },
      };
    } catch (error) {
      this.logger.error(`Error searching locations: ${error.message}`);
      return {
        data: [],
        meta: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems: 0,
          totalPages: 0,
        },
      };
    }
  }

  /**
   * Видобування координат з PostGIS формату
   */
  private extractCoordinates(postgisPoint: any): { latitude: number; longitude: number } | null {
    try {
      // Якщо це вже об'єкт з координатами, повертаємо його
      if (postgisPoint.latitude && postgisPoint.longitude) {
        return {
          latitude: postgisPoint.latitude,
          longitude: postgisPoint.longitude,
        };
      }

      // Якщо це PostGIS точка у вигляді рядка, парсимо її
      if (typeof postgisPoint === 'string') {
        // Формат: POINT(longitude latitude)
        const match = postgisPoint.match(/POINT\s*\(\s*([+-]?\d+(?:\.\d+)?)\s+([+-]?\d+(?:\.\d+)?)\s*\)/i);
        if (match) {
          return {
            longitude: parseFloat(match[1]),
            latitude: parseFloat(match[2]),
          };
        }
      }

      // Якщо це бінарний формат або інший складний об'єкт
      // У реальному додатку тут потрібен більш складний парсинг залежно від того,
      // як саме PostGIS повертає дані

      return null;
    } catch (error) {
      this.logger.error(`Error extracting coordinates: ${error.message}`);
      return null;
    }
  }
}
