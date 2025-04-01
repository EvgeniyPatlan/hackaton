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
var ModerationRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModerationRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ModerationRepository = ModerationRepository_1 = class ModerationRepository {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ModerationRepository_1.name);
    }
    async createModerationItem(data) {
        return this.prisma.moderationItem.create({
            data,
            include: {
                history: true,
            },
        });
    }
    async findModerationItemById(id) {
        return this.prisma.moderationItem.findUnique({
            where: { id },
            include: {
                history: true,
            },
        });
    }
    async findModerationItemsByItemId(itemType, itemId) {
        return this.prisma.moderationItem.findMany({
            where: {
                itemType,
                itemId,
            },
            include: {
                history: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async updateModerationItem(id, data) {
        return this.prisma.moderationItem.update({
            where: { id },
            data,
            include: {
                history: true,
            },
        });
    }
    async findModerationItems(params) {
        const { skip, take, where, orderBy } = params;
        return this.prisma.moderationItem.findMany({
            skip,
            take,
            where,
            orderBy,
            include: {
                history: true,
            },
        });
    }
    async countModerationItems(where) {
        return this.prisma.moderationItem.count({ where });
    }
    async createModerationHistory(data) {
        return this.prisma.moderationHistory.create({
            data,
        });
    }
    async createReport(data) {
        return this.prisma.report.create({
            data,
        });
    }
    async findReportById(id) {
        return this.prisma.report.findUnique({
            where: { id },
        });
    }
    async updateReport(id, data) {
        return this.prisma.report.update({
            where: { id },
            data,
        });
    }
    async findReports(params) {
        const { skip, take, where, orderBy } = params;
        return this.prisma.report.findMany({
            skip,
            take,
            where,
            orderBy,
        });
    }
    async countReports(where) {
        return this.prisma.report.count({ where });
    }
};
exports.ModerationRepository = ModerationRepository;
exports.ModerationRepository = ModerationRepository = ModerationRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ModerationRepository);
//# sourceMappingURL=moderation.repository.js.map