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
exports.CreateLocationDto = void 0;
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
class ContactsDto {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Телефон локації',
        example: '+380445555555',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ContactsDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Email локації',
        example: 'info@example.com',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ContactsDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Веб-сайт локації',
        example: 'https://example.com',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ContactsDto.prototype, "website", void 0);
class WorkingHoursDto {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Години роботи у будні дні',
        example: '9:00-18:00',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], WorkingHoursDto.prototype, "weekdays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Години роботи у суботу',
        example: '10:00-16:00',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], WorkingHoursDto.prototype, "saturday", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Години роботи у неділю',
        example: 'closed',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], WorkingHoursDto.prototype, "sunday", void 0);
class CreateLocationDto {
}
exports.CreateLocationDto = CreateLocationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Назва локації',
        example: 'ЦНАП Шевченківського району',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateLocationDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Адреса локації',
        example: 'м. Київ, бульвар Тараса Шевченка, 26/4',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateLocationDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Широта (latitude)',
        example: 50.446999,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsLatitude)(),
    __metadata("design:type", Number)
], CreateLocationDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Довгота (longitude)',
        example: 30.503324,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsLongitude)(),
    __metadata("design:type", Number)
], CreateLocationDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Тип локації',
        enum: LocationType,
        example: LocationType.GOVERNMENT_BUILDING,
    }),
    (0, class_validator_1.IsEnum)(LocationType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateLocationDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Категорія локації',
        example: 'cnap',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLocationDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Опис локації',
        example: 'Центр надання адміністративних послуг Шевченківського району',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLocationDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Контактна інформація',
        type: ContactsDto,
    }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ContactsDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", ContactsDto)
], CreateLocationDto.prototype, "contacts", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Години роботи',
        type: WorkingHoursDto,
    }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => WorkingHoursDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", WorkingHoursDto)
], CreateLocationDto.prototype, "workingHours", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID організації, якій належить локація',
        example: '2a4e62b8-cb61-4b05-90b3-8b6864ecf0aa',
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLocationDto.prototype, "organizationId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Статус локації',
        enum: LocationStatus,
        example: LocationStatus.DRAFT,
        default: LocationStatus.DRAFT,
    }),
    (0, class_validator_1.IsEnum)(LocationStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLocationDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Загальна оцінка доступності (1-100)',
        example: 85,
        minimum: 1,
        maximum: 100,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateLocationDto.prototype, "overallAccessibilityScore", void 0);
//# sourceMappingURL=create-location.dto.js.map