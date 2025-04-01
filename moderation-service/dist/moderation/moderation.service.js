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
var ModerationService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModerationService = void 0;
const common_1 = require("@nestjs/common");
const moderation_repository_1 = require("./moderation.repository");
const client_1 = require("@prisma/client");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let ModerationService = ModerationService_1 = class ModerationService {
    constructor(moderationRepository, httpService, configService) {
        this.moderationRepository = moderationRepository;
        this.httpService = httpService;
        this.configService = configService;
        this.logger = new common_1.Logger(ModerationService_1.name);
    }
    async submitForModeration(dto, submittedBy) {
        try {
            const newItem = await this.moderationRepository.createModerationItem({
                itemType: dto.itemType,
                itemId: dto.itemId,
                submittedBy,
                status: client_1.ModerationStatus.PENDING,
                reason: dto.reason,
                notes: dto.notes,
                history: {
                    create: {
                        status: client_1.ModerationStatus.PENDING,
                        reason: dto.reason,
                        notes: dto.notes,
                    },
                },
            });
            return newItem;
        }
        catch (error) {
            this.logger.error(`Failed to submit for moderation: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to submit for moderation: ${error.message}`);
        }
    }
    async moderateItem(id, dto, moderatedBy) {
        const item = await this.moderationRepository.findModerationItemById(id);
        if (!item) {
            throw new common_1.NotFoundException(`Moderation item with ID ${id} not found`);
        }
        const historyEntry = await this.moderationRepository.createModerationHistory({
            moderationItem: { connect: { id } },
            status: dto.status,
            reason: dto.reason,
            notes: dto.notes,
            moderatedBy,
        });
        const updatedItem = await this.moderationRepository.updateModerationItem(id, {
            status: dto.status,
            reason: dto.reason,
            notes: dto.notes,
            moderatedBy,
        });
        await this.notifyServiceAboutModeration(updatedItem);
        return updatedItem;
    }
    async notifyServiceAboutModeration(item) {
        try {
            let serviceUrl = '';
            switch (item.itemType) {
                case client_1.ItemType.LOCATION:
                    serviceUrl = `${this.configService.get('LOCATION_SERVICE_URL')}/locations/moderation/${item.itemId}`;
                    break;
                case client_1.ItemType.FILE:
                    serviceUrl = `${this.configService.get('FILE_SERVICE_URL')}/files/moderation/${item.itemId}`;
                    break;
                case client_1.ItemType.USER:
                    serviceUrl = `${this.configService.get('USER_SERVICE_URL')}/users/moderation/${item.itemId}`;
                    break;
                default:
                    this.logger.warn(`No service handling for item type: ${item.itemType}`);
                    return;
            }
            if (serviceUrl) {
                await (0, rxjs_1.firstValueFrom)(this.httpService.post(serviceUrl, {
                    id: item.itemId,
                    status: item.status,
                    reason: item.reason,
                    moderatedBy: item.moderatedBy,
                }));
                this.logger.log(`Notified service about moderation decision: ${item.itemId} - ${item.status}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to notify service about moderation: ${error.message}`);
        }
    }
    async getModerationItem(id) {
        const item = await this.moderationRepository.findModerationItemById(id);
        if (!item) {
            throw new common_1.NotFoundException(`Moderation item with ID ${id} not found`);
        }
        return item;
    }
    async getItemModerationHistory(itemType, itemId) {
        return this.moderationRepository.findModerationItemsByItemId(itemType, itemId);
    }
    async queryModerationItems(query) {
        const { status, itemType, page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (status) {
            where.status = status;
        }
        if (itemType) {
            where.itemType = itemType;
        }
        const [items, total] = await Promise.all([
            this.moderationRepository.findModerationItems({
                skip,
                take: limit,
                where,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.moderationRepository.countModerationItems(where),
        ]);
        return {
            items,
            total,
            page,
            limit,
        };
    }
};
exports.ModerationService = ModerationService;
exports.ModerationService = ModerationService = ModerationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [moderation_repository_1.ModerationRepository, typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object, config_1.ConfigService])
], ModerationService);
//# sourceMappingURL=moderation.service.js.map