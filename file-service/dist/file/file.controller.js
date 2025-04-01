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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var FileController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const file_service_1 = require("./file.service");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const upload_file_dto_1 = require("./dto/upload-file.dto");
const search_files_dto_1 = require("./dto/search-files.dto");
const get_user_decorator_1 = require("./decorators/get-user.decorator");
let FileController = FileController_1 = class FileController {
    constructor(fileService) {
        this.fileService = fileService;
        this.logger = new common_1.Logger(FileController_1.name);
    }
    async uploadFile(file, uploadFileDto, user) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        const result = await this.fileService.uploadFile(file, user.id, uploadFileDto.locationId, uploadFileDto.isPublic);
        return {
            id: result.id,
            originalName: result.originalName,
            filename: result.filename,
            mimeType: result.mimeType,
            size: result.size,
            thumbnailUrl: result.thumbnailPath ? `/files/thumbnail/${result.id}` : null,
            url: `/files/${result.id}`,
            createdAt: result.createdAt,
        };
    }
    async uploadMultipleFiles(files, uploadFileDto, user) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No files uploaded');
        }
        const uploadPromises = files.map(file => this.fileService.uploadFile(file, user.id, uploadFileDto.locationId, uploadFileDto.isPublic));
        const results = await Promise.all(uploadPromises);
        return results.map(result => ({
            id: result.id,
            originalName: result.originalName,
            filename: result.filename,
            mimeType: result.mimeType,
            size: result.size,
            thumbnailUrl: result.thumbnailPath ? `/files/thumbnail/${result.id}` : null,
            url: `/files/${result.id}`,
            createdAt: result.createdAt,
        }));
    }
    async getAllFiles(searchDto, user) {
        const { query, page, limit } = searchDto;
        const userId = user?.id;
        const result = await this.fileService.searchFiles(query, userId, page, limit);
        return {
            ...result,
            files: result.files.map(file => ({
                id: file.id,
                originalName: file.originalName,
                mimeType: file.mimeType,
                size: file.size,
                thumbnailUrl: file.thumbnailPath ? `/files/thumbnail/${file.id}` : null,
                url: `/files/${file.id}`,
                isPublic: file.isPublic,
                createdAt: file.createdAt,
            })),
        };
    }
    async getFilesByLocation(locationId) {
        const files = await this.fileService.getFilesByLocationId(locationId);
        return files.map(file => ({
            id: file.id,
            originalName: file.originalName,
            mimeType: file.mimeType,
            size: file.size,
            thumbnailUrl: file.thumbnailPath ? `/files/thumbnail/${file.id}` : null,
            url: `/files/${file.id}`,
            createdAt: file.createdAt,
        }));
    }
    async getFilesByUser(userId, user) {
        if (user.id !== userId && user.role !== 'ADMIN') {
            throw new common_1.BadRequestException('You can only access your own files');
        }
        const files = await this.fileService.getFilesByUserId(userId);
        return files.map(file => ({
            id: file.id,
            originalName: file.originalName,
            mimeType: file.mimeType,
            size: file.size,
            thumbnailUrl: file.thumbnailPath ? `/files/thumbnail/${file.id}` : null,
            url: `/files/${file.id}`,
            createdAt: file.createdAt,
        }));
    }
    async getFile(id, res, user) {
        try {
            const { stream, file } = await this.fileService.getFileStream(id, user?.id);
            res.set({
                'Content-Type': file.mimeType,
                'Content-Disposition': `inline; filename="${encodeURIComponent(file.originalName)}"`,
                'Content-Length': file.size,
            });
            stream.pipe(res);
        }
        catch (error) {
            this.logger.error(`Error retrieving file: ${error.message}`);
            res.status(404).send('File not found');
        }
    }
    async getThumbnail(id, res, user) {
        try {
            const { stream, file } = await this.fileService.getThumbnailStream(id, user?.id);
            res.set({
                'Content-Type': file.mimeType,
                'Content-Disposition': `inline; filename="thumb_${encodeURIComponent(file.originalName)}"`,
            });
            stream.pipe(res);
        }
        catch (error) {
            this.logger.error(`Error retrieving thumbnail: ${error.message}`);
            res.status(404).send('Thumbnail not found');
        }
    }
    async deleteFile(id, user) {
        const deleted = await this.fileService.deleteFile(id, user.id, user.role === 'ADMIN');
        return { success: deleted };
    }
};
exports.FileController = FileController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, upload_file_dto_1.UploadFileDto, Object]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Post)('upload/multiple'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10)),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, upload_file_dto_1.UploadFileDto, Object]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "uploadMultipleFiles", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_files_dto_1.SearchFilesDto, Object]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "getAllFiles", null);
__decorate([
    (0, common_1.Get)('location/:locationId'),
    __param(0, (0, common_1.Param)('locationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "getFilesByLocation", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "getFilesByUser", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "getFile", null);
__decorate([
    (0, common_1.Get)('thumbnail/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "getThumbnail", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "deleteFile", null);
exports.FileController = FileController = FileController_1 = __decorate([
    (0, common_1.Controller)('files'),
    __metadata("design:paramtypes", [file_service_1.FileService])
], FileController);
//# sourceMappingURL=file.controller.js.map