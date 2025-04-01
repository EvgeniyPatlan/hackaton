import { FileService } from './file.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { SearchFilesDto } from './dto/search-files.dto';
import { Response } from 'express';
export declare class FileController {
    private readonly fileService;
    private readonly logger;
    constructor(fileService: FileService);
    uploadFile(file: Express.Multer.File, uploadFileDto: UploadFileDto, user: any): Promise<{
        id: string;
        originalName: string;
        filename: string;
        mimeType: string;
        size: number;
        thumbnailUrl: string;
        url: string;
        createdAt: Date;
    }>;
    uploadMultipleFiles(files: Express.Multer.File[], uploadFileDto: UploadFileDto, user: any): Promise<{
        id: string;
        originalName: string;
        filename: string;
        mimeType: string;
        size: number;
        thumbnailUrl: string;
        url: string;
        createdAt: Date;
    }[]>;
    getAllFiles(searchDto: SearchFilesDto, user: any): Promise<{
        files: {
            id: string;
            originalName: string;
            mimeType: string;
            size: number;
            thumbnailUrl: string;
            url: string;
            isPublic: boolean;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    getFilesByLocation(locationId: string): Promise<{
        id: string;
        originalName: string;
        mimeType: string;
        size: number;
        thumbnailUrl: string;
        url: string;
        createdAt: Date;
    }[]>;
    getFilesByUser(userId: string, user: any): Promise<{
        id: string;
        originalName: string;
        mimeType: string;
        size: number;
        thumbnailUrl: string;
        url: string;
        createdAt: Date;
    }[]>;
    getFile(id: string, res: Response, user: any): Promise<void>;
    getThumbnail(id: string, res: Response, user: any): Promise<void>;
    deleteFile(id: string, user: any): Promise<{
        success: boolean;
    }>;
}
