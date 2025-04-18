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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryReportsDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
class QueryReportsDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
    }
}
exports.QueryReportsDto = QueryReportsDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.ReportStatus, { message: 'Invalid report status' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryReportsDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.ItemType, { message: 'Invalid item type' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryReportsDto.prototype, "itemType", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryReportsDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryReportsDto.prototype, "limit", void 0);
//# sourceMappingURL=query-reports.dto.js.map