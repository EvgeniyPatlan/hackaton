"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
let EmailService = EmailService_1 = class EmailService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(EmailService_1.name);
        const smtpConfig = {
            host: this.configService.get('SMTP_HOST'),
            port: this.configService.get('SMTP_PORT'),
            secure: this.configService.get('SMTP_SECURE'),
            auth: {
                user: this.configService.get('SMTP_USER'),
                pass: this.configService.get('SMTP_PASSWORD'),
            },
        };
        if (this.configService.get('NODE_ENV') === 'development' &&
            !this.configService.get('SMTP_HOST')) {
            this.logger.log('Using ethereal.email test account for email delivery');
            this.setupTestTransporter();
        }
        else {
            this.transporter = nodemailer.createTransport(smtpConfig);
        }
    }
    async setupTestTransporter() {
        try {
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
        }
        catch (error) {
            this.logger.error('Failed to create test email account', error);
        }
    }
    async sendEmail(to, subject, html, text) {
        try {
            if (!this.transporter) {
                await this.setupTestTransporter();
            }
            const mailOptions = {
                from: this.configService.get('EMAIL_FROM') || 'noreply@bezbarierny.gov.ua',
                to,
                subject,
                html,
                text: text || html.replace(/<[^>]*>/g, ''),
            };
            const info = await this.transporter.sendMail(mailOptions);
            this.logger.log(`Email sent: ${info.messageId}`);
            if (this.configService.get('NODE_ENV') === 'development') {
                this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
            }
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send email: ${error.message}`, error);
            return false;
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map