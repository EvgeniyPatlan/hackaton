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
var FileService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const file_repository_1 = require("./file.repository");
const image_processing_service_1 = require("./image-processing.service");
const client_1 = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const util = require("util");
const unlinkAsync = util.promisify(fs.unlink);
let FileService = FileService_1 = class FileService {
    constructor(fileRepository, imageProcessingService, configService) {
        this.fileRepository = fileRepository;
        this.imageProcessingService = imageProcessingService;
        this.configService = configService;
        this.logger = new common_1.Logger(FileService_1.name);
    }
    async uploadFile(file, userId, locationId, isPublic = true) {
        const uploadDir = this.configService.get('UPLOAD_DIR') || 'uploads';
        try {
            let thumbnailPath = null;
            let metadata = {};
            if (this.imageProcessingService.isImage(file.mimetype)) {
                thumbnailPath = await this.imageProcessingService.createThumbnail(file.path, file.filename);
                metadata = await this.imageProcessingService.getImageMetadata(file.path);
            }
            const fileData = {
                originalName: file.originalname,
                filename: file.filename,
                path: path.relative(process.cwd(), file.path),
                mimeType: file.mimetype,
                size: file.size,
                userId,
                locationId: locationId || null,
                isPublic,
                thumbnailPath,
                metadata,
            };
            return this.fileRepository.createFile(fileData);
        }
        catch (error) {
            try {
                await unlinkAsync(file.path);
            }
            catch (unlinkError) {
                this.logger.error(`Failed to clean up file: ${unlinkError.message}`);
            }
            this.logger.error(`Failed to upload file: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to upload file: ${error.message}`);
        }
    }
    async getFileById(id) {
        const file = await this.fileRepository.findFileById(id);
        if (!file || file.status === client_1.FileStatus.DELETED) {
            throw new common_1.NotFoundException(`File with ID ${id} not found`);
        }
        return file;
    }
    async getFileByFilename(filename) {
        const file = await this.fileRepository.findFileByFilename(filename);
        if (!file || file.status === client_1.FileStatus.DELETED) {
            throw new common_1.NotFoundException(`File with filename ${filename} not found`);
        }
        return file;
    }
    async getFileStream(id, userId) {
        const file = await this.getFileById(id);
        if (!file.isPublic && userId !== file.userId) {
            throw new common_1.ForbiddenException('You do not have permission to access this file');
        }
        const uploadDir = this.configService.get('UPLOAD_DIR') || 'uploads';
        const filePath = path.join(process.cwd(), file.path);
        if (!fs.existsSync(filePath)) {
            throw new common_1.NotFoundException(`File not found on the server`);
        }
        return {
            stream: fs.createReadStream(filePath),
            file,
        };
    }
    async getThumbnailStream(id, userId) {
        const file = await this.getFileById(id);
        if (!file.isPublic && userId !== file.userId) {
            throw new common_1.ForbiddenException('You do not have permission to access this file');
        }
        if (!file.thumbnailPath) {
            throw new common_1.NotFoundException('Thumbnail not available for this file');
        }
        const uploadDir = this.configService.get('UPLOAD_DIR') || 'uploads';
        const thumbnailPath = path.join(process.cwd(), uploadDir, file.thumbnailPath);
        if (!fs.existsSync(thumbnailPath)) {
            throw new common_1.NotFoundException(`Thumbnail not found on the server`);
        }
        return {
            stream: fs.createReadStream(thumbnailPath),
            file,
        };
    }
    async deleteFile(id, userId, isAdmin = false) {
        const file = await this.getFileById(id);
        if (!isAdmin && userId !== file.userId) {
            throw new common_1.ForbiddenException('You do not have permission to delete this file');
        }
        await this.fileRepository.softDeleteFile(id);
        return true;
    }
    async getFilesByLocationId(locationId) {
        return this.fileRepository.findFilesByLocationId(locationId);
    }
    async getFilesByUserId(userId) {
        return this.fileRepository.findFilesByUserId(userId);
    }
    async searchFiles(query, userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const whereClause = {
            status: client_1.FileStatus.ACTIVE,
            OR: [
                { originalName: { contains: query, mode: 'insensitive' } },
            ],
        };
        if (userId) {
            whereClause.OR.push({ userId });
        }
        else {
            whereClause.isPublic = true;
        }
        const [files, total] = await Promise.all([
            this.fileRepository.findFiles({
                skip,
                take: limit,
                where: whereClause,
                orderBy: { createdAt: 'desc' },
            }),
            this.fileRepository.countFiles(whereClause),
        ]);
        return {
            files,
            total,
            page,
            limit,
        };
    }
};
exports.FileService = FileService;
exports.FileService = FileService = FileService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [file_repository_1.FileRepository,
        image_processing_service_1.ImageProcessingService,
        config_1.ConfigService])
], FileService);
//# sourceMappingURL=file.service.js.map