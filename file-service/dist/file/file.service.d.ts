import { ConfigService } from '@nestjs/config';
import { FileRepository } from './file.repository';
import { ImageProcessingService } from './image-processing.service';
import { File } from '@prisma/client';
import * as fs from 'fs';
export declare class FileService {
    private fileRepository;
    private imageProcessingService;
    private configService;
    private readonly logger;
    constructor(fileRepository: FileRepository, imageProcessingService: ImageProcessingService, configService: ConfigService);
    uploadFile(file: Express.Multer.File, userId: string, locationId?: string, isPublic?: boolean): Promise<File>;
    getFileById(id: string): Promise<File>;
    getFileByFilename(filename: string): Promise<File>;
    getFileStream(id: string, userId?: string): Promise<{
        stream: fs.ReadStream;
        file: File;
    }>;
    getThumbnailStream(id: string, userId?: string): Promise<{
        stream: fs.ReadStream;
        file: File;
    }>;
    deleteFile(id: string, userId: string, isAdmin?: boolean): Promise<boolean>;
    getFilesByLocationId(locationId: string): Promise<File[]>;
    getFilesByUserId(userId: string): Promise<File[]>;
    searchFiles(query: string, userId?: string, page?: number, limit?: number): Promise<{
        files: File[];
        total: number;
        page: number;
        limit: number;
    }>;
}
