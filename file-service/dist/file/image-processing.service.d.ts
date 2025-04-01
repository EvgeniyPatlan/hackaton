import { ConfigService } from '@nestjs/config';
export declare class ImageProcessingService {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    createThumbnail(filePath: string, filename: string): Promise<string | null>;
    isImage(mimeType: string): boolean;
    getImageMetadata(filePath: string): Promise<any>;
}
