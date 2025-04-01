import { NotificationRepository } from './notification.repository';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
import { UserPreference } from '@prisma/client';
export declare class PreferenceService {
    private notificationRepository;
    private readonly logger;
    constructor(notificationRepository: NotificationRepository);
    getUserPreference(userId: string): Promise<UserPreference | null>;
    private createDefaultPreference;
    updatePreference(userId: string, dto: UpdatePreferenceDto): Promise<UserPreference>;
    addDeviceToken(userId: string, token: string): Promise<UserPreference>;
    removeDeviceToken(userId: string, token: string): Promise<UserPreference>;
}
