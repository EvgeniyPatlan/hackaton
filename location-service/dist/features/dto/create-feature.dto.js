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
exports.CreateFeatureDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var FeatureType;
(function (FeatureType) {
    FeatureType["RAMP"] = "ramp";
    FeatureType["ELEVATOR"] = "elevator";
    FeatureType["CALL_BUTTON"] = "call_button";
    FeatureType["TACTILE_PATH"] = "tactile_path";
    FeatureType["ACCESSIBLE_TOILET"] = "accessible_toilet";
    FeatureType["PARKING"] = "parking";
    FeatureType["ENTRANCE"] = "entrance";
    FeatureType["INTERIOR"] = "interior";
    FeatureType["SIGNAGE"] = "signage";
    FeatureType["OTHER"] = "other";
})(FeatureType || (FeatureType = {}));
class CreateFeatureDto {
}
exports.CreateFeatureDto = CreateFeatureDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Тип елементу безбар\'єрності',
        enum: FeatureType,
        example: FeatureType.RAMP,
    }),
    (0, class_validator_1.IsEnum)(FeatureType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateFeatureDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Підтип елементу безбар\'єрності',
        example: 'permanent',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFeatureDto.prototype, "subtype", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Опис елементу безбар\'єрності',
        example: 'Пандус при вході до будівлі',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFeatureDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Статус наявності елементу (true - наявний, false - відсутній)',
        example: true,
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Boolean)
], CreateFeatureDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Оцінка якості елементу (1-5)',
        minimum: 1,
        maximum: 5,
        example: 4,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateFeatureDto.prototype, "qualityRating", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Відповідність стандартам (ДБН)',
        example: true,
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateFeatureDto.prototype, "standardsCompliance", void 0);
//# sourceMappingURL=create-feature.dto.js.map