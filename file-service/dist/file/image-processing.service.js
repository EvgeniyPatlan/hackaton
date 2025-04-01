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
var ImageProcessingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageProcessingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
let ImageProcessingService = ImageProcessingService_1 = class ImageProcessingService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(ImageProcessingService_1.name);
    }
    async createThumbnail(filePath, filename) {
        try {
            const uploadDir = this.configService.get('UPLOAD_DIR') || 'uploads';
            const thumbnailDir = path.join(uploadDir, 'thumbnails');
            if (!fs.existsSync(thumbnailDir)) {
                fs.mkdirSync(thumbnailDir, { recursive: true });
            }
            const thumbnailPath = path.join(thumbnailDir, filename);
            await sharp(filePath)
                .resize(300, 300, { fit: 'inside' })
                .toFile(thumbnailPath);
            return path.join('thumbnails', filename);
        }
        catch (error) {
            this.logger.error(`Failed to create thumbnail: ${error.message}`);
            return null;
        }
    }
    isImage(mimeType) {
        return mimeType.startsWith('image/');
    }
    async getImageMetadata(filePath) {
        try {
            const metadata = await sharp(filePath).metadata();
            return {
                width: metadata.width,
                height: metadata.height,
                format: metadata.format,
                space: metadata.space,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get image metadata: ${error.message}`);
            return {};
        }
    }
};
exports.ImageProcessingService = ImageProcessingService;
exports.ImageProcessingService = ImageProcessingService = ImageProcessingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ImageProcessingService);
//# sourceMappingURL=image-processing.service.js.map