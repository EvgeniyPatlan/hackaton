import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  async sendPushNotification(
    deviceTokens: string[],
    title: string,
    body: string,
    data?: any,
  ): Promise<boolean> {
    try {
      // In a real implementation, you would use Firebase Cloud Messaging or another push provider
      // This is a simplified version for demonstration
      this.logger.log(`Sending push notification to ${deviceTokens.length} devices`);
      
      // Mock implementation
      if (this.configService.get<string>('NODE_ENV') === 'development') {
        this.logger.log(`[MOCK] Push notification sent to ${deviceTokens.join(', ')}`);
        this.logger.log(`Title: ${title}`);
        this.logger.log(`Body: ${body}`);
        if (data) {
          this.logger.log(`Data: ${JSON.stringify(data)}`);
        }
        return true;
      }
      
      // Real implementation would use FCM or another service
      const fcmUrl = 'https://fcm.googleapis.com/fcm/send';
      const fcmKey = this.configService.get<string>('FCM_SERVER_KEY');
      
      if (!fcmKey) {
        this.logger.warn('FCM_SERVER_KEY not set. Push notifications will not be sent.');
        return false;
      }
      
      // For each device token, send a message
      const promises = deviceTokens.map(token => {
        const message = {
          to: token,
          notification: {
            title,
            body,
          },
          data: data || {},
        };
        
        return firstValueFrom(
          this.httpService.post(fcmUrl, message, {
            headers: {
              Authorization: `key=${fcmKey}`,
              'Content-Type': 'application/json',
            },
          }),
        );
      });
      
      await Promise.all(promises);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${error.message}`, error);
      return false;
    }
  }
}
