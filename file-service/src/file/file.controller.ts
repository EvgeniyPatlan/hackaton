import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Body,
  Res,
  UseGuards,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UploadFileDto } from './dto/upload-file.dto';
import { SearchFilesDto } from './dto/search-files.dto';
import { Response } from 'express';
import { GetUser } from './decorators/get-user.decorator';

@Controller('files')
export class FileController {
  private readonly logger = new Logger(FileController.name);

  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileDto: UploadFileDto,
    @GetUser() user: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const result = await this.fileService.uploadFile(
      file,
      user.id,
      uploadFileDto.locationId,
      uploadFileDto.isPublic,
    );

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

  @Post('upload/multiple')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadFileDto: UploadFileDto,
    @GetUser() user: any,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const uploadPromises = files.map(file => 
      this.fileService.uploadFile(
        file,
        user.id,
        uploadFileDto.locationId,
        uploadFileDto.isPublic,
      )
    );

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

  @Get()
  async getAllFiles(
    @Query() searchDto: SearchFilesDto,
    @GetUser() user: any,
  ) {
    const { query, page, limit } = searchDto;
    const userId = user?.id; // Use ID from token if authenticated
    
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

  @Get('location/:locationId')
  async getFilesByLocation(@Param('locationId') locationId: string) {
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

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  async getFilesByUser(
    @Param('userId') userId: string,
    @GetUser() user: any,
  ) {
    // Check if user is requesting their own files or is an admin
    if (user.id !== userId && user.role !== 'ADMIN') {
      throw new BadRequestException('You can only access your own files');
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

  @Get(':id')
  async getFile(
    @Param('id') id: string,
    @Res() res: Response,
    @GetUser() user: any,
  ) {
    try {
      const { stream, file } = await this.fileService.getFileStream(id, user?.id);
      
      res.set({
        'Content-Type': file.mimeType,
        'Content-Disposition': `inline; filename="${encodeURIComponent(file.originalName)}"`,
        'Content-Length': file.size,
      });
      
      stream.pipe(res);
    } catch (error) {
      this.logger.error(`Error retrieving file: ${error.message}`);
      res.status(404).send('File not found');
    }
  }

  @Get('thumbnail/:id')
  async getThumbnail(
    @Param('id') id: string,
    @Res() res: Response,
    @GetUser() user: any,
  ) {
    try {
      const { stream, file } = await this.fileService.getThumbnailStream(id, user?.id);
      
      res.set({
        'Content-Type': file.mimeType,
        'Content-Disposition': `inline; filename="thumb_${encodeURIComponent(file.originalName)}"`,
      });
      
      stream.pipe(res);
    } catch (error) {
      this.logger.error(`Error retrieving thumbnail: ${error.message}`);
      res.status(404).send('Thumbnail not found');
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteFile(
    @Param('id') id: string,
    @GetUser() user: any,
  ) {
    const deleted = await this.fileService.deleteFile(id, user.id, user.role === 'ADMIN');
    return { success: deleted };
  }
}
