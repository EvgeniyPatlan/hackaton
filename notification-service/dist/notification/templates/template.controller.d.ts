import { TemplateService } from './template.service';
import { CreateTemplateDto } from '../dto/create-template.dto';
import { UpdateTemplateDto } from '../dto/update-template.dto';
export declare class TemplateController {
    private readonly templateService;
    constructor(templateService: TemplateService);
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
}
