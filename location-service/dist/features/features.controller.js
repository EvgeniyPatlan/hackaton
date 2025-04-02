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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeaturesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const features_service_1 = require("./features.service");
const create_feature_dto_1 = require("./dto/create-feature.dto");
const update_feature_dto_1 = require("./dto/update-feature.dto");
const filter_features_dto_1 = require("./dto/filter-features.dto");
class JwtAuthGuard {
}
let FeaturesController = class FeaturesController {
    constructor(featuresService) {
        this.featuresService = featuresService;
    }
    async findAll(locationId, filterDto) {
        return this.featuresService.findAllByLocation(locationId, filterDto);
    }
    async findOne(id) {
        return this.featuresService.findById(id);
    }
    async create(locationId, createFeatureDto, req) {
        const userId = req.user?.id || 'system';
        return this.featuresService.create(locationId, createFeatureDto, userId);
    }
    async update(id, updateFeatureDto) {
        return this.featuresService.update(id, updateFeatureDto);
    }
    async remove(id) {
        await this.featuresService.delete(id);
    }
};
exports.FeaturesController = FeaturesController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Отримати всі елементи безбар\'єрності для локації' }),
    (0, swagger_1.ApiParam)({ name: 'locationId', description: 'ID локації' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Список елементів безбар\'єрності успішно отримано',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Локацію не знайдено' }),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('locationId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, filter_features_dto_1.FilterFeaturesDto]),
    __metadata("design:returntype", Promise)
], FeaturesController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Отримати елемент безбар\'єрності за ID' }),
    (0, swagger_1.ApiParam)({ name: 'locationId', description: 'ID локації' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID елементу безбар\'єрності' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Елемент безбар\'єрності успішно знайдено',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Елемент безбар\'єрності не знайдено' }),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FeaturesController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Створити новий елемент безбар\'єрності' }),
    (0, swagger_1.ApiParam)({ name: 'locationId', description: 'ID локації' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Елемент безбар\'єрності успішно створено',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Локацію не знайдено' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('locationId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_feature_dto_1.CreateFeatureDto, Object]),
    __metadata("design:returntype", Promise)
], FeaturesController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Оновити елемент безбар\'єрності' }),
    (0, swagger_1.ApiParam)({ name: 'locationId', description: 'ID локації' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID елементу безбар\'єрності' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Елемент безбар\'єрності успішно оновлено',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Елемент безбар\'єрності не знайдено' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(JwtAuthGuard),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_feature_dto_1.UpdateFeatureDto]),
    __metadata("design:returntype", Promise)
], FeaturesController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Видалити елемент безбар\'єрності' }),
    (0, swagger_1.ApiParam)({ name: 'locationId', description: 'ID локації' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID елементу безбар\'єрності' }),
    (0, swagger_1.ApiResponse)({
        status: 204,
        description: 'Елемент безбар\'єрності успішно видалено',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Елемент безбар\'єрності не знайдено' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FeaturesController.prototype, "remove", null);
exports.FeaturesController = FeaturesController = __decorate([
    (0, swagger_1.ApiTags)('features'),
    (0, common_1.Controller)('locations/:locationId/features'),
    __metadata("design:paramtypes", [features_service_1.FeaturesService])
], FeaturesController);
//# sourceMappingURL=features.controller.js.map