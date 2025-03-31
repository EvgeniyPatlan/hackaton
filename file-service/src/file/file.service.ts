import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileRepository } from './file.repository';
import { ImageProcessingService } from './image-processing.service';
import { File, FileStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

const unlinkAsync = util.promisify(fs.unlink);

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  constructor(
    private fileRepository: FileRepository,
    private imageProcessingService: ImageProcessingService,
    private configService: ConfigService,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    locationId?: string,
    isPublic: boolean = true,
  ): Promise<File> {
    const uploadDir = this.configService.get<string>('UPLOAD_DIR') || 'uploads';

    try {
      let thumbnailPath = null;
      let metadata = {};

      // Process image if applicable
      if (this.imageProcessingService.isImage(file.mimetype)) {
        thumbnailPath = await this.imageProcessingService.createThumbnail(
          file.path,
          file.filename,
        );
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
    } catch (error) {
      // Clean up the file if there was an error
      try {
        await unlinkAsync(file.path);
      } catch (unlinkError) {
        this.logger.error(`Failed to clean up file: ${unlinkError.message}`);
      }
      
      this.logger.error(`Failed to upload file: ${error.message}`);
      throw new BadRequestException(`Failed to upload file: ${error.message}`);
    }
  }

  async getFileById(id: string): Promise<File> {
    const file = await this.fileRepository.findFileById(id);
    if (!file || file.status === FileStatus.DELETED) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }
    return file;
  }

  async getFileByFilename(filename: string): Promise<File> {
    const file = await this.fileRepository.findFileByFilename(filename);
    if (!file || file.status === FileStatus.DELETED) {
      throw new NotFoundException(`File with filename ${filename} not found`);
    }
    return file;
  }

  async getFileStream(id: string, userId?: string): Promise<{ stream: fs.ReadStream; file: File }> {
    const file = await this.getFileById(id);

    // Check access permissions
    if (!file.isPublic && userId !== file.userId) {
      throw new ForbiddenException('You do not have permission to access this file');
    }

    const uploadDir = this.configService.get<string>('UPLOAD_DIR') || 'uploads';
    const filePath = path.join(process.cwd(), file.path);

    // Check if file exists on the file system
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`File not found on the server`);
    }

    return {
      stream: fs.createReadStream(filePath),
      file,
    };
  }

  async getThumbnailStream(id: string, userId?: string): Promise<{ stream: fs.ReadStream; file: File }> {
    const file = await this.getFileById(id);

    // Check access permissions
    if (!file.isPublic && userId !== file.userId) {
      throw new ForbiddenException('You do not have permission to access this file');
    }

    if (!file.thumbnailPath) {
      throw new NotFoundException('Thumbnail not available for this file');
    }

    const uploadDir = this.configService.get<string>('UPLOAD_DIR') || 'uploads';
    const thumbnailPath = path.join(process.cwd(), uploadDir, file.thumbnailPath);

    // Check if thumbnail exists on the file system
    if (!fs.existsSync(thumbnailPath)) {
      throw new NotFoundException(`Thumbnail not found on the server`);
    }

    return {
      stream: fs.createReadStream(thumbnailPath),
      file,
    };
  }

  async deleteFile(id: string, userId: string, isAdmin: boolean = false): Promise<boolean> {
    const file = await this.getFileById(id);

    // Check permissions
    if (!isAdmin && userId !== file.userId) {
      throw new ForbiddenException('You do not have permission to delete this file');
    }

    // Soft delete in database
    await this.fileRepository.softDeleteFile(id);

    // We can add a background job to actually delete the files after some time
    // For now, we'll keep the files on the disk

    return true;
  }

  async getFilesByLocationId(locationId: string): Promise<File[]> {
    return this.fileRepository.findFilesByLocationId(locationId);
  }

  async getFilesByUserId(userId: string): Promise<File[]> {
    return this.fileRepository.findFilesByUserId(userId);
  }

  async searchFiles(
    query: string,
    userId?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ files: File[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const whereClause: any = {
      status: FileStatus.ACTIVE,
      OR: [
        { originalName: { contains: query, mode: 'insensitive' } },
      ],
    };

    // If userId is provided, limit to that user's files or public files
    if (userId) {
      whereClause.OR.push({ userId });
    } else {
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
}
