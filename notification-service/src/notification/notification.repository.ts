import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
  Notification, 
  NotificationChannel, 
  UserPreference, 
  NotificationTemplate,
  Prisma, 
  NotificationType, 
  Channel,
  DeliveryStatus
} from '@prisma/client';

@Injectable()
export class NotificationRepository {
  private readonly logger = new Logger(NotificationRepository.name);

  constructor(private prisma: PrismaService) {}

  // Notifications
  async createNotification(data: Prisma.NotificationCreateInput): Promise<Notification> {
    return this.prisma.notification.create({
      data,
      include: {
        sentVia: true,
      },
    });
  }

  async findNotificationById(id: string): Promise<Notification | null> {
    return this.prisma.notification.findUnique({
      where: { id },
      include: {
        sentVia: true,
      },
    });
  }

  async updateNotification(
    id: string,
    data: Prisma.NotificationUpdateInput,
  ): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id },
      data,
      include: {
        sentVia: true,
      },
    });
  }

  async findNotifications(params: {
    skip?: number;
    take?: number;
    where?: Prisma.NotificationWhereInput;
    orderBy?: Prisma.NotificationOrderByWithRelationInput;
  }): Promise<Notification[]> {
    const { skip, take, where, orderBy } = params;
    return this.prisma.notification.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        sentVia: true,
      },
    });
  }

  async countNotifications(where?: Prisma.NotificationWhereInput): Promise<number> {
    return this.prisma.notification.count({ where });
  }

  async findUserNotifications(
    userId: string,
    onlyUnread?: boolean,
    skip = 0,
    take = 10,
  ): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: {
        userId,
        isActive: true,
        ...(onlyUnread ? { read: false } : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
      include: {
        sentVia: true,
      },
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string): Promise<Prisma.BatchPayload> {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    });
  }

  // Notification Channels
  async createNotificationChannel(
    data: Prisma.NotificationChannelCreateInput,
  ): Promise<NotificationChannel> {
    return this.prisma.notificationChannel.create({
      data,
    });
  }

  async updateNotificationChannel(
    id: string,
    data: Prisma.NotificationChannelUpdateInput,
  ): Promise<NotificationChannel> {
    return this.prisma.notificationChannel.update({
      where: { id },
      data,
    });
  }

  async findPendingNotificationChannels(): Promise<NotificationChannel[]> {
    return this.prisma.notificationChannel.findMany({
      where: {
        status: DeliveryStatus.PENDING,
      },
      include: {
        notification: true,
      },
    });
  }

  // User Preferences
  async findUserPreference(userId: string): Promise<UserPreference | null> {
    return this.prisma.userPreference.findUnique({
      where: { userId },
    });
  }

  async createUserPreference(
    data: Prisma.UserPreferenceCreateInput,
  ): Promise<UserPreference> {
    return this.prisma.userPreference.create({
      data,
    });
  }

  async updateUserPreference(
    userId: string,
    data: Prisma.UserPreferenceUpdateInput,
  ): Promise<UserPreference> {
    return this.prisma.userPreference.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    });
  }

  // Notification Templates
  async findTemplate(
    name: string,
  ): Promise<NotificationTemplate | null> {
    return this.prisma.notificationTemplate.findUnique({
      where: { name },
    });
  }

  async createTemplate(
    data: Prisma.NotificationTemplateCreateInput,
  ): Promise<NotificationTemplate> {
    return this.prisma.notificationTemplate.create({
      data,
    });
  }

  async updateTemplate(
    id: string,
    data: Prisma.NotificationTemplateUpdateInput,
  ): Promise<NotificationTemplate> {
    return this.prisma.notificationTemplate.update({
      where: { id },
      data,
    });
  }

  async findAllTemplates(): Promise<NotificationTemplate[]> {
    return this.prisma.notificationTemplate.findMany({
      where: {
        isActive: true,
      },
    });
  }
}
