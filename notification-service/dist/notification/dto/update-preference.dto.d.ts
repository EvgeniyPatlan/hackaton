import { NotificationType } from '@prisma/client';
export declare class UpdatePreferenceDto {
    emailEnabled?: boolean;
    pushEnabled?: boolean;
    smsEnabled?: boolean;
    emailAddress?: string;
    phoneNumber?: string;
    deviceTokens?: string[];
    categories?: NotificationType[];
}
