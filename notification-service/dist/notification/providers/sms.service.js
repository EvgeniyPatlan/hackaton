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
var SmsService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let SmsService = SmsService_1 = class SmsService {
    constructor(configService, httpService) {
        this.configService = configService;
        this.httpService = httpService;
        this.logger = new common_1.Logger(SmsService_1.name);
    }
    async sendSms(phoneNumber, message) {
        try {
            this.logger.log(`Sending SMS to ${phoneNumber}`);
            if (this.configService.get('NODE_ENV') === 'development') {
                this.logger.log(`[MOCK] SMS sent to ${phoneNumber}`);
                this.logger.log(`Message: ${message}`);
                return true;
            }
            const smsProvider = this.configService.get('SMS_PROVIDER');
            const smsApiKey = this.configService.get('SMS_API_KEY');
            if (!smsProvider || !smsApiKey) {
                this.logger.warn('SMS provider configuration not set. SMS will not be sent.');
                return false;
            }
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`https://api.${smsProvider}.com/messages`, {
                to: phoneNumber,
                message,
            }, {
                headers: {
                    Authorization: `Bearer ${smsApiKey}`,
                    'Content-Type': 'application/json',
                },
            }));
            this.logger.log(`SMS sent with ID: ${response.data.id}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send SMS: ${error.message}`, error);
            return false;
        }
    }
};
exports.SmsService = SmsService;
exports.SmsService = SmsService = SmsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService, typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object])
], SmsService);
//# sourceMappingURL=sms.service.js.map