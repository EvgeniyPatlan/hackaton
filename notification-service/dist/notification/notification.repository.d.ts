import { PrismaService } from '../prisma/prisma.service';
import { Notification, NotificationChannel, UserPreference, NotificationTemplate, Prisma } from '@prisma/client';
export declare class NotificationRepository {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createNotification(data: Prisma.NotificationCreateInput): Promise<Notification>;
    findNotificationById(id: string): Promise<Notification | null>;
    updateNotification(id: string, data: Prisma.NotificationUpdateInput): Promise<Notification>;
    findNotifications(params: {
        skip?: number;
        take?: number;
        where?: Prisma.NotificationWhereInput;
        orderBy?: Prisma.NotificationOrderByWithRelationInput;
    }): Promise<Notification[]>;
    countNotifications(where?: Prisma.NotificationWhereInput): Promise<number>;
    findUserNotifications(userId: string, onlyUnread?: boolean, skip?: number, take?: number): Promise<Notification[]>;
    markAsRead(id: string): Promise<Notification>;
    markAllAsRead(userId: string): Promise<Prisma.BatchPayload>;
    createNotificationChannel(data: Prisma.NotificationChannelCreateInput): Promise<NotificationChannel>;
    updateNotificationChannel(id: string, data: Prisma.NotificationChannelUpdateInput): Promise<NotificationChannel>;
    findPendingNotificationChannels(): Promise<NotificationChannel[]>;
    findUserPreference(userId: string): Promise<UserPreference | null>;
    createUserPreference(data: Prisma.UserPreferenceCreateInput): Promise<UserPreference>;
    updateUserPreference(userId: string, data: Prisma.UserPreferenceUpdateInput): Promise<UserPreference>;
    findTemplate(name: string): Promise<NotificationTemplate | null>;
    createTemplate(data: Prisma.NotificationTemplateCreateInput): Promise<NotificationTemplate>;
    updateTemplate(id: string, data: Prisma.NotificationTemplateUpdateInput): Promise<NotificationTemplate>;
    findAllTemplates(): Promise<NotificationTemplate[]>;
}
