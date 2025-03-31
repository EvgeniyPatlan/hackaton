import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FileRepository } from './file.repository';
import { ImageProcessingService } from './image-processing.service';

@Module({
  imports: [PrismaModule],
  controllers: [FileController],
  providers: [FileService, FileRepository, ImageProcessingService],
  exports: [FileService],
})
export class FileModule {}
