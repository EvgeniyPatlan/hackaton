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
var PreferenceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreferenceService = void 0;
const common_1 = require("@nestjs/common");
const notification_repository_1 = require("./notification.repository");
const client_1 = require("@prisma/client");
let PreferenceService = PreferenceService_1 = class PreferenceService {
    constructor(notificationRepository) {
        this.notificationRepository = notificationRepository;
        this.logger = new common_1.Logger(PreferenceService_1.name);
    }
    async getUserPreference(userId) {
        const preference = await this.notificationRepository.findUserPreference(userId);
        if (!preference) {
            return this.createDefaultPreference(userId);
        }
        return preference;
    }
    async createDefaultPreference(userId) {
        try {
            return await this.notificationRepository.createUserPreference({
                userId,
                emailEnabled: true,
                pushEnabled: true,
                smsEnabled: false,
                categories: Object.values(client_1.NotificationType),
            });
        }
        catch (error) {
            this.logger.error(`Failed to create default preferences: ${error.message}`);
            return null;
        }
    }
    async updatePreference(userId, dto) {
        const existing = await this.notificationRepository.findUserPreference(userId);
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
    async addDeviceToken(userId, token) {
        const preference = await this.getUserPreference(userId);
        if (!preference.deviceTokens.includes(token)) {
            return this.notificationRepository.updateUserPreference(userId, {
                deviceTokens: {
                    push: token,
                },
            });
        }
        return preference;
    }
    async removeDeviceToken(userId, token) {
        const preference = await this.getUserPreference(userId);
        if (!preference) {
            throw new common_1.NotFoundException(`Preferences for user ${userId} not found`);
        }
        return this.notificationRepository.updateUserPreference(userId, {
            deviceTokens: {
                set: preference.deviceTokens.filter(t => t !== token),
            },
        });
    }
};
exports.PreferenceService = PreferenceService;
exports.PreferenceService = PreferenceService = PreferenceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notification_repository_1.NotificationRepository])
], PreferenceService);
//# sourceMappingURL=preference.service.js.map