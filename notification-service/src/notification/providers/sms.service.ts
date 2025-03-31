import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  async sendSms(phoneNumber: string, message: string): Promise<boolean> {
    try {
      // In a real implementation, you would use Twilio, Nexmo, or another SMS provider
      // This is a simplified version for demonstration
      this.logger.log(`Sending SMS to ${phoneNumber}`);
      
      // Mock implementation
      if (this.configService.get<string>('NODE_ENV') === 'development') {
        this.logger.log(`[MOCK] SMS sent to ${phoneNumber}`);
        this.logger.log(`Message: ${message}`);
        return true;
      }
      
      // Simplified implementation (would need to be replaced with actual SMS provider)
      const smsProvider = this.configService.get<string>('SMS_PROVIDER');
      const smsApiKey = this.configService.get<string>('SMS_API_KEY');
      
      if (!smsProvider || !smsApiKey) {
        this.logger.warn('SMS provider configuration not set. SMS will not be sent.');
        return false;
      }
      
      // Example with a generic API call (replace with your actual SMS provider)
      const response = await firstValueFrom(
        this.httpService.post(
          `https://api.${smsProvider}.com/messages`,
          {
            to: phoneNumber,
            message,
          },
          {
            headers: {
              Authorization: `Bearer ${smsApiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
      
      this.logger.log(`SMS sent with ID: ${response.data.id}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send SMS: ${error.message}`, error);
      return false;
    }
  }
}
