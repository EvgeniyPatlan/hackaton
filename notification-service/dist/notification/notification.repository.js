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
var NotificationRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let NotificationRepository = NotificationRepository_1 = class NotificationRepository {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(NotificationRepository_1.name);
    }
    async createNotification(data) {
        return this.prisma.notification.create({
            data,
            include: {
                sentVia: true,
            },
        });
    }
    async findNotificationById(id) {
        return this.prisma.notification.findUnique({
            where: { id },
            include: {
                sentVia: true,
            },
        });
    }
    async updateNotification(id, data) {
        return this.prisma.notification.update({
            where: { id },
            data,
            include: {
                sentVia: true,
            },
        });
    }
    async findNotifications(params) {
        const { skip, take, where, orderBy } = params;
        return this.prisma.notification.findMany({
            skip,
            take,
            where,
            orderBy,
            include: {
                sentVia: true,
            },
        });
    }
    async countNotifications(where) {
        return this.prisma.notification.count({ where });
    }
    async findUserNotifications(userId, onlyUnread, skip = 0, take = 10) {
        return this.prisma.notification.findMany({
            where: {
                userId,
                isActive: true,
                ...(onlyUnread ? { read: false } : {}),
            },
            orderBy: {
                createdAt: 'desc',
            },
            skip,
            take,
            include: {
                sentVia: true,
            },
        });
    }
    async markAsRead(id) {
        return this.prisma.notification.update({
            where: { id },
            data: { read: true },
        });
    }
    async markAllAsRead(userId) {
        return this.prisma.notification.updateMany({
            where: {
                userId,
                read: false,
            },
            data: {
                read: true,
            },
        });
    }
    async createNotificationChannel(data) {
        return this.prisma.notificationChannel.create({
            data,
        });
    }
    async updateNotificationChannel(id, data) {
        return this.prisma.notificationChannel.update({
            where: { id },
            data,
        });
    }
    async findPendingNotificationChannels() {
        return this.prisma.notificationChannel.findMany({
            where: {
                status: client_1.DeliveryStatus.PENDING,
            },
            include: {
                notification: true,
            },
        });
    }
    async findUserPreference(userId) {
        return this.prisma.userPreference.findUnique({
            where: { userId },
        });
    }
    async createUserPreference(data) {
        return this.prisma.userPreference.create({
            data,
        });
    }
    async updateUserPreference(userId, data) {
        return this.prisma.userPreference.upsert({
            where: { userId },
            update: data,
            create: {
                userId,
                ...data,
            },
        });
    }
    async findTemplate(name) {
        return this.prisma.notificationTemplate.findUnique({
            where: { name },
        });
    }
    async createTemplate(data) {
        return this.prisma.notificationTemplate.create({
            data,
        });
    }
    async updateTemplate(id, data) {
        return this.prisma.notificationTemplate.update({
            where: { id },
            data,
        });
    }
    async findAllTemplates() {
        return this.prisma.notificationTemplate.findMany({
            where: {
                isActive: true,
            },
        });
    }
};
exports.NotificationRepository = NotificationRepository;
exports.NotificationRepository = NotificationRepository = NotificationRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationRepository);
//# sourceMappingURL=notification.repository.js.map