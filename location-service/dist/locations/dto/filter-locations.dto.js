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
exports.FilterLocationsDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
var LocationType;
(function (LocationType) {
    LocationType["GOVERNMENT_BUILDING"] = "government_building";
    LocationType["BUSINESS"] = "business";
    LocationType["HEALTHCARE"] = "healthcare";
    LocationType["EDUCATION"] = "education";
    LocationType["CULTURE"] = "culture";
    LocationType["TRANSPORT"] = "transport";
    LocationType["RECREATION"] = "recreation";
    LocationType["OTHER"] = "other";
})(LocationType || (LocationType = {}));
var LocationStatus;
(function (LocationStatus) {
    LocationStatus["DRAFT"] = "draft";
    LocationStatus["PENDING"] = "pending";
    LocationStatus["PUBLISHED"] = "published";
    LocationStatus["REJECTED"] = "rejected";
})(LocationStatus || (LocationStatus = {}));
class FilterLocationsDto {
}
exports.FilterLocationsDto = FilterLocationsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Номер сторінки для пагінації',
        default: 1,
        minimum: 1,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], FilterLocationsDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Кількість елементів на сторінку',
        default: 10,
        minimum: 1,
        maximum: 100,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], FilterLocationsDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Тип локації',
        enum: LocationType,
    }),
    (0, class_validator_1.IsEnum)(LocationType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FilterLocationsDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Категорія локації',
        example: 'cnap',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FilterLocationsDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Мінімальна оцінка доступності (1-100)',
        minimum: 1,
        maximum: 100,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], FilterLocationsDto.prototype, "minAccessibilityScore", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Статус локації',
        enum: LocationStatus,
        default: LocationStatus.PUBLISHED,
    }),
    (0, class_validator_1.IsEnum)(LocationStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FilterLocationsDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Чи включати елементи безбар`єрності у відповідь',
        default: false,
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Boolean),
    __metadata("design:type", Boolean)
], FilterLocationsDto.prototype, "withFeatures", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Широта для пошуку за радіусом',
        example: 50.446999,
    }),
    (0, class_validator_1.IsLatitude)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], FilterLocationsDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Довгота для пошуку за радіусом',
        example: 30.503324,
    }),
    (0, class_validator_1.IsLongitude)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], FilterLocationsDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Радіус пошуку в метрах',
        example: 1000,
        minimum: 100,
        maximum: 50000,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(100),
    (0, class_validator_1.Max)(50000),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], FilterLocationsDto.prototype, "radius", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Пошуковий запит для текстового пошуку',
        example: 'центр надання',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FilterLocationsDto.prototype, "search", void 0);
//# sourceMappingURL=filter-locations.dto.js.map