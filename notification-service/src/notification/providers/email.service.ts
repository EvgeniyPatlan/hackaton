import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    // Create a nodemailer transporter
    const smtpConfig = {
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: this.configService.get<boolean>('SMTP_SECURE'),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    };

    // For development, use a test account
    if (this.configService.get<string>('NODE_ENV') === 'development' && 
        !this.configService.get<string>('SMTP_HOST')) {
      this.logger.log('Using ethereal.email test account for email delivery');
      this.setupTestTransporter();
    } else {
      this.transporter = nodemailer.createTransport(smtpConfig);
    }
  }

  private async setupTestTransporter() {
    try {
      // Generate test SMTP service account from ethereal.email
      const testAccount = await nodemailer.createTestAccount();

      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      this.logger.log(`Test email account created: ${testAccount.user}`);
    } catch (error) {
      this.logger.error('Failed to create test email account', error);
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string,
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        await this.setupTestTransporter();
      }

      const mailOptions = {
        from: this.configService.get<string>('EMAIL_FROM') || 'noreply@bezbarierny.gov.ua',
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML tags for text version
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent: ${info.messageId}`);

      // Log link to preview email (for development with ethereal.email)
      if (this.configService.get<string>('NODE_ENV') === 'development') {
        this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }

      return true;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error);
      return false;
    }
  }
}
