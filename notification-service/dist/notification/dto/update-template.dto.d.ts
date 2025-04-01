import { NotificationType } from '@prisma/client';
export declare class UpdateTemplateDto {
    type?: NotificationType;
    subject?: string;
    htmlBody?: string;
    textBody?: string;
    isActive?: boolean;
}
