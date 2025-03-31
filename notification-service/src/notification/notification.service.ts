import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationRepository } from './notification.repository';
import { TemplateService } from './templates/template.service';
import { EmailService } from './providers/email.service';
import { PushService } from './providers/push.service';
import { SmsService } from './providers/sms.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationType, Channel, DeliveryStatus } from '@prisma/client';
import { PreferenceService } from './preference.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private notificationRepository: NotificationRepository,
    private templateService: TemplateService,
    private emailService: EmailService,
    private pushService: PushService,
    private smsService: SmsService,
    private preferenceService: PreferenceService,
  ) {}

  async createNotification(dto: CreateNotificationDto) {
    try {
      // Check user preferences
      const userPreference = await this.preferenceService.getUserPreference(dto.userId);
      
      // Skip if user has disabled this type of notification
      if (userPreference?.categories && 
          !userPreference.categories.includes(dto.type)) {
        this.logger.log(`User ${dto.userId} has disabled ${dto.type} notifications`);
        return null;
      }

      // Process template if template name is provided
      if (dto.templateName) {
        const processed = await this.templateService.processTemplate(
          dto.templateName,
          dto.templateData || {},
        );
        
        if (processed) {
          dto.title = processed.subject || dto.title;
          dto.message = processed.message || dto.message;
        }
      }

      // Create notification
      const notification = await this.notificationRepository.createNotification({
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        metadata: dto.metadata as any,
        sentVia: {
          create: this.getEnabledChannels(userPreference, dto.channels).map(channel => ({
            channel,
            status: DeliveryStatus.PENDING,
          })),
        },
      });

      // Process delivery immediately for in-app notifications
      return notification;
    } catch (error) {
      this.logger.error(`Failed to create notification: ${error.message}`);
      throw new BadRequestException(`Failed to create notification: ${error.message}`);
    }
  }

  private getEnabledChannels(userPreference: any, requestedChannels: Channel[]) {
    if (!userPreference) {
      // Default to in-app only if no preferences
      return [Channel.IN_APP];
    }

    return requestedChannels.filter(channel => {
      switch (channel) {
        case Channel.EMAIL:
          return userPreference.emailEnabled && userPreference.emailAddress;
        case Channel.PUSH:
          return userPreference.pushEnabled && userPreference.deviceTokens?.length > 0;
        case Channel.SMS:
          return userPreference.smsEnabled && userPreference.phoneNumber;
        case Channel.IN_APP:
          return true; // In-app is always enabled
        default:
          return false;
      }
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async processNotificationQueue() {
    this.logger.debug('Processing notification queue');
    const pendingDeliveries = await this.notificationRepository.findPendingNotificationChannels();
    
    if (pendingDeliveries.length === 0) {
      return;
    }
    
    this.logger.log(`Processing ${pendingDeliveries.length} pending notifications`);
    
    for (const delivery of pendingDeliveries) {
      try {
        const { notification } = delivery;
        const userPreference = await this.preferenceService.getUserPreference(notification.userId);
        
        let success = false;
        let error = null;
        
        switch (delivery.channel) {
          case Channel.EMAIL:
            if (userPreference?.emailAddress) {
              success = await this.emailService.sendEmail(
                userPreference.emailAddress,
                notification.title,
                notification.message,
              );
            } else {
              error = 'User has no email address';
            }
            break;
            
          case Channel.PUSH:
            if (userPreference?.deviceTokens?.length > 0) {
              success = await this.pushService.sendPushNotification(
                userPreference.deviceTokens,
                notification.title,
                notification.message,
                notification.metadata,
              );
            } else {
              error = 'User has no device tokens';
            }
            break;
            
          case Channel.SMS:
            if (userPreference?.phoneNumber) {
              success = await this.smsService.sendSms(
                userPreference.phoneNumber,
                notification.message,
              );
            } else {
              error = 'User has no phone number';
            }
            break;
            
          case Channel.IN_APP:
            // In-app notifications are delivered automatically
            success = true;
            break;
        }
        
        // Update delivery status
        await this.notificationRepository.updateNotificationChannel(delivery.id, {
          status: success ? DeliveryStatus.SENT : DeliveryStatus.FAILED,
          sentAt: success ? new Date() : undefined,
          error: error,
        });
      } catch (error) {
        this.logger.error(`Failed to process notification ${delivery.id}: ${error.message}`);
        
        await this.notificationRepository.updateNotificationChannel(delivery.id, {
          status: DeliveryStatus.FAILED,
          error: error.message,
        });
      }
    }
  }

  async getUserNotifications(userId: string, onlyUnread = false, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [notifications, total] = await Promise.all([
      this.notificationRepository.findUserNotifications(userId, onlyUnread, skip, limit),
      this.notificationRepository.countNotifications({
        userId,
        isActive: true,
        ...(onlyUnread ? { read: false } : {}),
      }),
    ]);
    
    return {
      notifications,
      total,
      page,
      limit,
      unreadCount: onlyUnread ? total : await this.notificationRepository.countNotifications({
        userId,
        isActive: true,
        read: false,
      }),
    };
  }
  
  async markAsRead(id: string, userId: string) {
    const notification = await this.notificationRepository.findNotificationById(id);
    
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    
    if (notification.userId !== userId) {
      throw new BadRequestException('You do not have permission to read this notification');
    }
    
    return this.notificationRepository.markAsRead(id);
  }
  
  async markAllAsRead(userId: string) {
    return this.notificationRepository.markAllAsRead(userId);
  }
}
