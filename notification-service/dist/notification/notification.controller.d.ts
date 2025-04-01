import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
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
    getMyNotifications(user: any, unread: boolean, page: number, limit: number): Promise<{
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
    markAsRead(id: string, user: any): Promise<{
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
    markAllAsRead(user: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
