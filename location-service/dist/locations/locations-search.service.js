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
var LocationsSearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationsSearchService = void 0;
const common_1 = require("@nestjs/common");
const elasticsearch_1 = require("@nestjs/elasticsearch");
let LocationsSearchService = LocationsSearchService_1 = class LocationsSearchService {
    constructor(elasticsearchService) {
        this.elasticsearchService = elasticsearchService;
        this.logger = new common_1.Logger(LocationsSearchService_1.name);
        this.index = 'locations';
        this.createIndex();
    }
    async createIndex() {
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
        }
        catch (error) {
            this.logger.error(`Error creating index: ${error.message}`);
        }
    }
    async indexLocation(location) {
        try {
            const coordinates = location.coordinates
                ? this.extractCoordinates(location.coordinates)
                : null;
            const document = {
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
        }
        catch (error) {
            this.logger.error(`Error indexing location: ${error.message}`);
        }
    }
    async updateIndexedLocation(location) {
        try {
            const exists = await this.elasticsearchService.exists({
                index: this.index,
                id: location.id,
            });
            if (exists) {
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
            }
            else {
                await this.indexLocation(location);
            }
        }
        catch (error) {
            this.logger.error(`Error updating indexed location: ${error.message}`);
        }
    }
    async removeIndexedLocation(locationId) {
        try {
            await this.elasticsearchService.delete({
                index: this.index,
                id: locationId,
            });
            this.logger.log(`Removed indexed location: ${locationId}`);
        }
        catch (error) {
            this.logger.error(`Error removing indexed location: ${error.message}`);
        }
    }
    async search(text, page = 1, limit = 10) {
        const from = (page - 1) * limit;
        try {
            const { hits } = await this.elasticsearchService.search({
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
            const count = hits.total;
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
        }
        catch (error) {
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
    extractCoordinates(postgisPoint) {
        try {
            if (postgisPoint.latitude && postgisPoint.longitude) {
                return {
                    latitude: postgisPoint.latitude,
                    longitude: postgisPoint.longitude,
                };
            }
            if (typeof postgisPoint === 'string') {
                const match = postgisPoint.match(/POINT\s*\(\s*([+-]?\d+(?:\.\d+)?)\s+([+-]?\d+(?:\.\d+)?)\s*\)/i);
                if (match) {
                    return {
                        longitude: parseFloat(match[1]),
                        latitude: parseFloat(match[2]),
                    };
                }
            }
            return null;
        }
        catch (error) {
            this.logger.error(`Error extracting coordinates: ${error.message}`);
            return null;
        }
    }
};
exports.LocationsSearchService = LocationsSearchService;
exports.LocationsSearchService = LocationsSearchService = LocationsSearchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [elasticsearch_1.ElasticsearchService])
], LocationsSearchService);
//# sourceMappingURL=locations-search.service.js.map