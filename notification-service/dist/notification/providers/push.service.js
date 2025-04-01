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
var PushService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let PushService = PushService_1 = class PushService {
    constructor(configService, httpService) {
        this.configService = configService;
        this.httpService = httpService;
        this.logger = new common_1.Logger(PushService_1.name);
    }
    async sendPushNotification(deviceTokens, title, body, data) {
        try {
            this.logger.log(`Sending push notification to ${deviceTokens.length} devices`);
            if (this.configService.get('NODE_ENV') === 'development') {
                this.logger.log(`[MOCK] Push notification sent to ${deviceTokens.join(', ')}`);
                this.logger.log(`Title: ${title}`);
                this.logger.log(`Body: ${body}`);
                if (data) {
                    this.logger.log(`Data: ${JSON.stringify(data)}`);
                }
                return true;
            }
            const fcmUrl = 'https://fcm.googleapis.com/fcm/send';
            const fcmKey = this.configService.get('FCM_SERVER_KEY');
            if (!fcmKey) {
                this.logger.warn('FCM_SERVER_KEY not set. Push notifications will not be sent.');
                return false;
            }
            const promises = deviceTokens.map(token => {
                const message = {
                    to: token,
                    notification: {
                        title,
                        body,
                    },
                    data: data || {},
                };
                return (0, rxjs_1.firstValueFrom)(this.httpService.post(fcmUrl, message, {
                    headers: {
                        Authorization: `key=${fcmKey}`,
                        'Content-Type': 'application/json',
                    },
                }));
            });
            await Promise.all(promises);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send push notification: ${error.message}`, error);
            return false;
        }
    }
};
exports.PushService = PushService;
exports.PushService = PushService = PushService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService, typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object])
], PushService);
//# sourceMappingURL=push.service.js.map