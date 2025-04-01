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
var ReportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const common_1 = require("@nestjs/common");
const moderation_repository_1 = require("./moderation.repository");
const client_1 = require("@prisma/client");
let ReportService = ReportService_1 = class ReportService {
    constructor(moderationRepository) {
        this.moderationRepository = moderationRepository;
        this.logger = new common_1.Logger(ReportService_1.name);
    }
    async createReport(dto, reportedBy) {
        try {
            const newReport = await this.moderationRepository.createReport({
                itemType: dto.itemType,
                itemId: dto.itemId,
                reason: dto.reason,
                description: dto.description,
                reportedBy,
                status: client_1.ReportStatus.PENDING,
            });
            return newReport;
        }
        catch (error) {
            this.logger.error(`Failed to create report: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to create report: ${error.message}`);
        }
    }
    async resolveReport(id, dto, resolvedBy) {
        const report = await this.moderationRepository.findReportById(id);
        if (!report) {
            throw new common_1.NotFoundException(`Report with ID ${id} not found`);
        }
        if (report.status !== client_1.ReportStatus.PENDING) {
            throw new common_1.BadRequestException(`Cannot resolve report that is already ${report.status}`);
        }
        return this.moderationRepository.updateReport(id, {
            status: dto.status,
            resolution: dto.resolution,
            resolvedBy,
        });
    }
    async getReport(id) {
        const report = await this.moderationRepository.findReportById(id);
        if (!report) {
            throw new common_1.NotFoundException(`Report with ID ${id} not found`);
        }
        return report;
    }
    async queryReports(query) {
        const { status, itemType, page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (status) {
            where.status = status;
        }
        if (itemType) {
            where.itemType = itemType;
        }
        const [reports, total] = await Promise.all([
            this.moderationRepository.findReports({
                skip,
                take: limit,
                where,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.moderationRepository.countReports(where),
        ]);
        return {
            reports,
            total,
            page,
            limit,
        };
    }
};
exports.ReportService = ReportService;
exports.ReportService = ReportService = ReportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [moderation_repository_1.ModerationRepository])
], ReportService);
//# sourceMappingURL=report.service.js.map