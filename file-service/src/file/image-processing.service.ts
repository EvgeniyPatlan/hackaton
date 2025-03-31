import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class ImageProcessingService {
  private readonly logger = new Logger(ImageProcessingService.name);

  constructor(private configService: ConfigService) {}

  async createThumbnail(
    filePath: string,
    filename: string,
  ): Promise<string | null> {
    try {
      const uploadDir = this.configService.get<string>('UPLOAD_DIR') || 'uploads';
      const thumbnailDir = path.join(uploadDir, 'thumbnails');
      
      // Make sure thumbnail directory exists
      if (!fs.existsSync(thumbnailDir)) {
        fs.mkdirSync(thumbnailDir, { recursive: true });
      }
      
      const thumbnailPath = path.join(thumbnailDir, filename);
      
      // Check if file is an image by trying to process it with sharp
      await sharp(filePath)
        .resize(300, 300, { fit: 'inside' })
        .toFile(thumbnailPath);
      
      // Return relative path to thumbnail
      return path.join('thumbnails', filename);
    } catch (error) {
      this.logger.error(`Failed to create thumbnail: ${error.message}`);
      return null;
    }
  }

  isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  async getImageMetadata(filePath: string): Promise<any> {
    try {
      const metadata = await sharp(filePath).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        space: metadata.space,
      };
    } catch (error) {
      this.logger.error(`Failed to get image metadata: ${error.message}`);
      return {};
    }
  }
}
