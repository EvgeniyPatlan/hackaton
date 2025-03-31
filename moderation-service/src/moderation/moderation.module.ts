import { Module } from '@nestjs/common';
import { ModerationController } from './moderation.controller';
import { ModerationService } from './moderation.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ModerationRepository } from './moderation.repository';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [ModerationController, ReportController],
  providers: [ModerationService, ModerationRepository, ReportService],
  exports: [ModerationService, ReportService],
})
export class ModerationModule {}
