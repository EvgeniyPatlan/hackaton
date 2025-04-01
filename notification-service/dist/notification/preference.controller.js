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
exports.PreferenceController = void 0;
const common_1 = require("@nestjs/common");
const preference_service_1 = require("./preference.service");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const update_preference_dto_1 = require("./dto/update-preference.dto");
const get_user_decorator_1 = require("./guards/get-user.decorator");
let PreferenceController = class PreferenceController {
    constructor(preferenceService) {
        this.preferenceService = preferenceService;
    }
    async getPreferences(user) {
        return this.preferenceService.getUserPreference(user.id);
    }
    async updatePreferences(user, dto) {
        return this.preferenceService.updatePreference(user.id, dto);
    }
    async addDeviceToken(user, token) {
        return this.preferenceService.addDeviceToken(user.id, token);
    }
    async removeDeviceToken(user, token) {
        return this.preferenceService.removeDeviceToken(user.id, token);
    }
};
exports.PreferenceController = PreferenceController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PreferenceController.prototype, "getPreferences", null);
__decorate([
    (0, common_1.Put)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_preference_dto_1.UpdatePreferenceDto]),
    __metadata("design:returntype", Promise)
], PreferenceController.prototype, "updatePreferences", null);
__decorate([
    (0, common_1.Post)('devices'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PreferenceController.prototype, "addDeviceToken", null);
__decorate([
    (0, common_1.Delete)('devices/:token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PreferenceController.prototype, "removeDeviceToken", null);
exports.PreferenceController = PreferenceController = __decorate([
    (0, common_1.Controller)('preferences'),
    __metadata("design:paramtypes", [preference_service_1.PreferenceService])
], PreferenceController);
//# sourceMappingURL=preference.controller.js.map