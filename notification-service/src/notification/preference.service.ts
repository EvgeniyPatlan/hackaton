import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
import { NotificationType, UserPreference } from '@prisma/client';

@Injectable()
export class PreferenceService {
  private readonly logger = new Logger(PreferenceService.name);

  constructor(private notificationRepository: NotificationRepository) {}

  async getUserPreference(userId: string): Promise<UserPreference | null> {
    const preference = await this.notificationRepository.findUserPreference(userId);
    
    // If no preference exists, create default
    if (!preference) {
      return this.createDefaultPreference(userId);
    }
    
    return preference;
  }
  
  private async createDefaultPreference(userId: string): Promise<UserPreference> {
    try {
      return await this.notificationRepository.createUserPreference({
        userId,
        emailEnabled: true,
        pushEnabled: true,
        smsEnabled: false,
        categories: Object.values(NotificationType),
      });
    } catch (error) {
      this.logger.error(`Failed to create default preferences: ${error.message}`);
      // Return null instead of throwing so notification delivery won't fail
      return null;
    }
  }
  
  async updatePreference(userId: string, dto: UpdatePreferenceDto): Promise<UserPreference> {
    // Check if user preference exists
    const existing = await this.notificationRepository.findUserPreference(userId);
    
    // Create or update
    return this.notificationRepository.updateUserPreference(userId, {
      ...(dto.emailEnabled !== undefined && { emailEnabled: dto.emailEnabled }),
      ...(dto.pushEnabled !== undefined && { pushEnabled: dto.pushEnabled }),
      ...(dto.smsEnabled !== undefined && { smsEnabled: dto.smsEnabled }),
      ...(dto.emailAddress !== undefined && { emailAddress: dto.emailAddress }),
      ...(dto.phoneNumber !== undefined && { phoneNumber: dto.phoneNumber }),
      ...(dto.deviceTokens !== undefined && { deviceTokens: dto.deviceTokens }),
      ...(dto.categories !== undefined && { categories: dto.categories }),
    });
  }
  
  async addDeviceToken(userId: string, token: string): Promise<UserPreference> {
    const preference = await this.getUserPreference(userId);
    
    // Add token if it doesn't exist already
    if (!preference.deviceTokens.includes(token)) {
      return this.notificationRepository.updateUserPreference(userId, {
        deviceTokens: {
          push: token,
        },
      });
    }
    
    return preference;
  }
  
  async removeDeviceToken(userId: string, token: string): Promise<UserPreference> {
    const preference = await this.getUserPreference(userId);
    
    if (!preference) {
      throw new NotFoundException(`Preferences for user ${userId} not found`);
    }
    
    // Remove token if it exists
    return this.notificationRepository.updateUserPreference(userId, {
      deviceTokens: {
        set: preference.deviceTokens.filter(t => t !== token),
      },
    });
  }
}
