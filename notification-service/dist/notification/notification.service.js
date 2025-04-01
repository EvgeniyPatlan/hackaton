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
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const notification_repository_1 = require("./notification.repository");
const template_service_1 = require("./templates/template.service");
const email_service_1 = require("./providers/email.service");
const push_service_1 = require("./providers/push.service");
const sms_service_1 = require("./providers/sms.service");
const client_1 = require("@prisma/client");
const preference_service_1 = require("./preference.service");
let NotificationService = NotificationService_1 = class NotificationService {
    constructor(notificationRepository, templateService, emailService, pushService, smsService, preferenceService) {
        this.notificationRepository = notificationRepository;
        this.templateService = templateService;
        this.emailService = emailService;
        this.pushService = pushService;
        this.smsService = smsService;
        this.preferenceService = preferenceService;
        this.logger = new common_1.Logger(NotificationService_1.name);
    }
    async createNotification(dto) {
        try {
            const userPreference = await this.preferenceService.getUserPreference(dto.userId);
            if (userPreference?.categories &&
                !userPreference.categories.includes(dto.type)) {
                this.logger.log(`User ${dto.userId} has disabled ${dto.type} notifications`);
                return null;
            }
            if (dto.templateName) {
                const processed = await this.templateService.processTemplate(dto.templateName, dto.templateData || {});
                if (processed) {
                    dto.title = processed.subject || dto.title;
                    dto.message = processed.message || dto.message;
                }
            }
            const notification = await this.notificationRepository.createNotification({
                userId: dto.userId,
                type: dto.type,
                title: dto.title,
                message: dto.message,
                metadata: dto.metadata,
                sentVia: {
                    create: this.getEnabledChannels(userPreference, dto.channels).map(channel => ({
                        channel,
                        status: client_1.DeliveryStatus.PENDING,
                    })),
                },
            });
            return notification;
        }
        catch (error) {
            this.logger.error(`Failed to create notification: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to create notification: ${error.message}`);
        }
    }
    getEnabledChannels(userPreference, requestedChannels) {
        if (!userPreference) {
            return [client_1.Channel.IN_APP];
        }
        return requestedChannels.filter(channel => {
            switch (channel) {
                case client_1.Channel.EMAIL:
                    return userPreference.emailEnabled && userPreference.emailAddress;
                case client_1.Channel.PUSH:
                    return userPreference.pushEnabled && userPreference.deviceTokens?.length > 0;
                case client_1.Channel.SMS:
                    return userPreference.smsEnabled && userPreference.phoneNumber;
                case client_1.Channel.IN_APP:
                    return true;
                default:
                    return false;
            }
        });
    }
    async processNotificationQueue() {
        this.logger.debug('Processing notification queue');
        const pendingDeliveries = await this.notificationRepository.findPendingNotificationChannels();
        if (pendingDeliveries.length === 0) {
            return;
        }
        this.logger.log(`Processing ${pendingDeliveries.length} pending notifications`);
        for (const delivery of pendingDeliveries) {
            try {
                const { notification } = delivery;
                const userPreference = await this.preferenceService.getUserPreference(notification.userId);
                let success = false;
                let error = null;
                switch (delivery.channel) {
                    case client_1.Channel.EMAIL:
                        if (userPreference?.emailAddress) {
                            success = await this.emailService.sendEmail(userPreference.emailAddress, notification.title, notification.message);
                        }
                        else {
                            error = 'User has no email address';
                        }
                        break;
                    case client_1.Channel.PUSH:
                        if (userPreference?.deviceTokens?.length > 0) {
                            success = await this.pushService.sendPushNotification(userPreference.deviceTokens, notification.title, notification.message, notification.metadata);
                        }
                        else {
                            error = 'User has no device tokens';
                        }
                        break;
                    case client_1.Channel.SMS:
                        if (userPreference?.phoneNumber) {
                            success = await this.smsService.sendSms(userPreference.phoneNumber, notification.message);
                        }
                        else {
                            error = 'User has no phone number';
                        }
                        break;
                    case client_1.Channel.IN_APP:
                        success = true;
                        break;
                }
                await this.notificationRepository.updateNotificationChannel(delivery.id, {
                    status: success ? client_1.DeliveryStatus.SENT : client_1.DeliveryStatus.FAILED,
                    sentAt: success ? new Date() : undefined,
                    error: error,
                });
            }
            catch (error) {
                this.logger.error(`Failed to process notification ${delivery.id}: ${error.message}`);
                await this.notificationRepository.updateNotificationChannel(delivery.id, {
                    status: client_1.DeliveryStatus.FAILED,
                    error: error.message,
                });
            }
        }
    }
    async getUserNotifications(userId, onlyUnread = false, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [notifications, total] = await Promise.all([
            this.notificationRepository.findUserNotifications(userId, onlyUnread, skip, limit),
            this.notificationRepository.countNotifications({
                userId,
                isActive: true,
                ...(onlyUnread ? { read: false } : {}),
            }),
        ]);
        return {
            notifications,
            total,
            page,
            limit,
            unreadCount: onlyUnread ? total : await this.notificationRepository.countNotifications({
                userId,
                isActive: true,
                read: false,
            }),
        };
    }
    async markAsRead(id, userId) {
        const notification = await this.notificationRepository.findNotificationById(id);
        if (!notification) {
            throw new common_1.NotFoundException(`Notification with ID ${id} not found`);
        }
        if (notification.userId !== userId) {
            throw new common_1.BadRequestException('You do not have permission to read this notification');
        }
        return this.notificationRepository.markAsRead(id);
    }
    async markAllAsRead(userId) {
        return this.notificationRepository.markAllAsRead(userId);
    }
};
exports.NotificationService = NotificationService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationService.prototype, "processNotificationQueue", null);
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notification_repository_1.NotificationRepository,
        template_service_1.TemplateService,
        email_service_1.EmailService,
        push_service_1.PushService,
        sms_service_1.SmsService,
        preference_service_1.PreferenceService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map