import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { EmailService } from './providers/email.service';
import { PushService } from './providers/push.service';
import { SmsService } from './providers/sms.service';
import { TemplateService } from './templates/template.service';
import { NotificationRepository } from './notification.repository';
import { PreferenceController } from './preference.controller';
import { PreferenceService } from './preference.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TemplateController } from './templates/template.controller';

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [NotificationController, PreferenceController, TemplateController],
  providers: [
    NotificationService,
    EmailService,
    PushService,
    SmsService,
    TemplateService,
    NotificationRepository,
    PreferenceService,
  ],
  exports: [NotificationService, PreferenceService],
})
export class NotificationModule {}
