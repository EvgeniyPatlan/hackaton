import { PreferenceService } from './preference.service';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
export declare class PreferenceController {
    private readonly preferenceService;
    constructor(preferenceService: PreferenceService);
    getPreferences(user: any): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        emailEnabled: boolean;
        pushEnabled: boolean;
        smsEnabled: boolean;
        emailAddress: string | null;
        phoneNumber: string | null;
        deviceTokens: string[];
        categories: import(".prisma/client").$Enums.NotificationType[];
    }>;
    updatePreferences(user: any, dto: UpdatePreferenceDto): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        emailEnabled: boolean;
        pushEnabled: boolean;
        smsEnabled: boolean;
        emailAddress: string | null;
        phoneNumber: string | null;
        deviceTokens: string[];
        categories: import(".prisma/client").$Enums.NotificationType[];
    }>;
    addDeviceToken(user: any, token: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        emailEnabled: boolean;
        pushEnabled: boolean;
        smsEnabled: boolean;
        emailAddress: string | null;
        phoneNumber: string | null;
        deviceTokens: string[];
        categories: import(".prisma/client").$Enums.NotificationType[];
    }>;
    removeDeviceToken(user: any, token: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        emailEnabled: boolean;
        pushEnabled: boolean;
        smsEnabled: boolean;
        emailAddress: string | null;
        phoneNumber: string | null;
        deviceTokens: string[];
        categories: import(".prisma/client").$Enums.NotificationType[];
    }>;
}
