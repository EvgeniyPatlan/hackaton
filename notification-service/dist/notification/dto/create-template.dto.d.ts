import { NotificationType } from '@prisma/client';
export declare class CreateTemplateDto {
    name: string;
    type: NotificationType;
    subject?: string;
    htmlBody?: string;
    textBody: string;
}
