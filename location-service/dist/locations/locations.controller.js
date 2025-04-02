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
exports.LocationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const locations_service_1 = require("./locations.service");
const create_location_dto_1 = require("./dto/create-location.dto");
const update_location_dto_1 = require("./dto/update-location.dto");
const filter_locations_dto_1 = require("./dto/filter-locations.dto");
class JwtAuthGuard {
}
let LocationsController = class LocationsController {
    constructor(locationsService) {
        this.locationsService = locationsService;
    }
    async findAll(filterDto) {
        return this.locationsService.findAll(filterDto);
    }
    async findOne(id, includeFeatures) {
        return this.locationsService.findById(id, includeFeatures);
    }
    async create(createLocationDto, req) {
        const userId = req.user?.id || 'system';
        return this.locationsService.create(createLocationDto, userId);
    }
    async update(id, updateLocationDto, req) {
        const userId = req.user?.id || 'system';
        return this.locationsService.update(id, updateLocationDto, userId);
    }
    async remove(id) {
        await this.locationsService.delete(id);
    }
    async updateStatus(id, status) {
        return this.locationsService.updateStatus(id, status);
    }
    async updateScore(id, score) {
        return this.locationsService.updateAccessibilityScore(id, score);
    }
    async findByOrganization(organizationId) {
        return this.locationsService.findByOrganization(organizationId);
    }
    async findByCurrentUser(req) {
        const userId = req.user?.id;
        return this.locationsService.findByUser(userId);
    }
};
exports.LocationsController = LocationsController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Отримати всі локації' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Список локацій успішно отримано',
    }),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_locations_dto_1.FilterLocationsDto]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Отримати локацію за ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID локації' }),
    (0, swagger_1.ApiQuery)({
        name: 'includeFeatures',
        required: false,
        type: Boolean,
        description: 'Чи включати елементи безбар\'єрності',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Локацію успішно знайдено',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Локацію не знайдено' }),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('includeFeatures')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Створити нову локацію' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Локацію успішно створено',
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_location_dto_1.CreateLocationDto, Object]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Оновити локацію' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID локації' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Локацію успішно оновлено',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Локацію не знайдено' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(JwtAuthGuard),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_location_dto_1.UpdateLocationDto, Object]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Видалити локацію' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID локації' }),
    (0, swagger_1.ApiResponse)({
        status: 204,
        description: 'Локацію успішно видалено',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Локацію не знайдено' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "remove", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Оновити статус локації' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID локації' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Статус локації успішно оновлено',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Локацію не знайдено' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(JwtAuthGuard),
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "updateStatus", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Оновити оцінку доступності локації' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID локації' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Оцінку доступності локації успішно оновлено',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Локацію не знайдено' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(JwtAuthGuard),
    (0, common_1.Patch)(':id/score'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('score')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "updateScore", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Отримати локації за організацією' }),
    (0, swagger_1.ApiParam)({ name: 'organizationId', description: 'ID організації' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Список локацій організації успішно отримано',
    }),
    (0, common_1.Get)('by-organization/:organizationId'),
    __param(0, (0, common_1.Param)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "findByOrganization", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Отримати локації за користувачем' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Список локацій користувача успішно отримано',
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(JwtAuthGuard),
    (0, common_1.Get)('by-user/me'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "findByCurrentUser", null);
exports.LocationsController = LocationsController = __decorate([
    (0, swagger_1.ApiTags)('locations'),
    (0, common_1.Controller)('locations'),
    __metadata("design:paramtypes", [locations_service_1.LocationsService])
], LocationsController);
//# sourceMappingURL=locations.controller.js.map