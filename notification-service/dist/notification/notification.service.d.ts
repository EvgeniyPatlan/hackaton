import { NotificationRepository } from './notification.repository';
import { TemplateService } from './templates/template.service';
import { EmailService } from './providers/email.service';
import { PushService } from './providers/push.service';
import { SmsService } from './providers/sms.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PreferenceService } from './preference.service';
export declare class NotificationService {
    private notificationRepository;
    private templateService;
    private emailService;
    private pushService;
    private smsService;
    private preferenceService;
    private readonly logger;
    constructor(notificationRepository: NotificationRepository, templateService: TemplateService, emailService: EmailService, pushService: PushService, smsService: SmsService, preferenceService: PreferenceService);
    createNotification(dto: CreateNotificationDto): Promise<{
        id: string;
        userId: string;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        message: string;
        read: boolean;
        isActive: boolean;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private getEnabledChannels;
    processNotificationQueue(): Promise<void>;
    getUserNotifications(userId: string, onlyUnread?: boolean, page?: number, limit?: number): Promise<{
        notifications: {
            id: string;
            userId: string;
            type: import(".prisma/client").$Enums.NotificationType;
            title: string;
            message: string;
            read: boolean;
            isActive: boolean;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
        unreadCount: number;
    }>;
    markAsRead(id: string, userId: string): Promise<{
        id: string;
        userId: string;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        message: string;
        read: boolean;
        isActive: boolean;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    markAllAsRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
