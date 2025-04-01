import { NotificationRepository } from '../notification.repository';
import { CreateTemplateDto } from '../dto/create-template.dto';
import { UpdateTemplateDto } from '../dto/update-template.dto';
export declare class TemplateService {
    private notificationRepository;
    private readonly logger;
    private readonly compiledTemplates;
    constructor(notificationRepository: NotificationRepository);
    getTemplate(name: string): Promise<{
        name: string;
        id: string;
        type: import(".prisma/client").$Enums.NotificationType;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        subject: string | null;
        htmlBody: string | null;
        textBody: string;
    }>;
    createTemplate(dto: CreateTemplateDto): Promise<{
        name: string;
        id: string;
        type: import(".prisma/client").$Enums.NotificationType;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        subject: string | null;
        htmlBody: string | null;
        textBody: string;
    }>;
    updateTemplate(id: string, dto: UpdateTemplateDto): Promise<{
        name: string;
        id: string;
        type: import(".prisma/client").$Enums.NotificationType;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        subject: string | null;
        htmlBody: string | null;
        textBody: string;
    }>;
    getAllTemplates(): Promise<{
        name: string;
        id: string;
        type: import(".prisma/client").$Enums.NotificationType;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        subject: string | null;
        htmlBody: string | null;
        textBody: string;
    }[]>;
    processTemplate(name: string, data: Record<string, any>): Promise<{
        subject: string;
        message: any;
        html: any;
    }>;
}
