import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './prisma/prisma.module';
import { FileModule } from './file/file.module';
import { HealthModule } from './health/health.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION') || '1h',
        },
      }),
    }),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        storage: diskStorage({
          destination: (req, file, cb) => {
            const uploadDir = configService.get<string>('UPLOAD_DIR') || 'uploads';
            cb(null, uploadDir);
          },
          filename: (req, file, cb) => {
            const extension = path.extname(file.originalname);
            const filename = `${uuidv4()}${extension}`;
            cb(null, filename);
          },
        }),
        limits: {
          fileSize: configService.get<number>('MAX_FILE_SIZE') || 5 * 1024 * 1024, // 5MB default
        },
        fileFilter: (req, file, cb) => {
          const allowedMimeTypes = configService.get<string>('ALLOWED_MIME_TYPES') || 
            'image/jpeg,image/png,image/gif,application/pdf';
          
          if (allowedMimeTypes.split(',').includes(file.mimetype)) {
            cb(null, true);
          } else {
            cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
          }
        },
      }),
    }),
    PrismaModule,
    FileModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
