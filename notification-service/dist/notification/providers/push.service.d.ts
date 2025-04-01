import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
export declare class PushService {
    private configService;
    private httpService;
    private readonly logger;
    constructor(configService: ConfigService, httpService: HttpService);
    sendPushNotification(deviceTokens: string[], title: string, body: string, data?: any): Promise<boolean>;
}
