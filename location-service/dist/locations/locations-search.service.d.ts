import { ElasticsearchService } from '@nestjs/elasticsearch';
export declare class LocationsSearchService {
    private readonly elasticsearchService;
    private readonly logger;
    private readonly index;
    constructor(elasticsearchService: ElasticsearchService);
    private createIndex;
    indexLocation(location: any): Promise<void>;
    updateIndexedLocation(location: any): Promise<void>;
    removeIndexedLocation(locationId: string): Promise<void>;
    search(text: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            name: string;
            address: string;
            type: string;
            category: string;
            overallAccessibilityScore: number;
            coordinates: {
                lat: number;
                lon: number;
            };
            score: number;
        }[];
        meta: {
            currentPage: number;
            itemsPerPage: number;
            totalItems: number;
            totalPages: number;
        };
    }>;
    private extractCoordinates;
}
