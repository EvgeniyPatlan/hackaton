import { NotificationType, Channel } from '@prisma/client';
export declare class CreateNotificationDto {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    channels: Channel[];
    templateName?: string;
    templateData?: Record<string, any>;
    metadata?: Record<string, any>;
}
