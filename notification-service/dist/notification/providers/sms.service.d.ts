import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
export declare class SmsService {
    private configService;
    private httpService;
    private readonly logger;
    constructor(configService: ConfigService, httpService: HttpService);
    sendSms(phoneNumber: string, message: string): Promise<boolean>;
}
