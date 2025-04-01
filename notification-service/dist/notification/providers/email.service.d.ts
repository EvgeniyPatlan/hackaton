import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private configService;
    private transporter;
    private readonly logger;
    constructor(configService: ConfigService);
    private setupTestTransporter;
    sendEmail(to: string, subject: string, html: string, text?: string): Promise<boolean>;
}
