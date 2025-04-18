"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeaturesModule = void 0;
const common_1 = require("@nestjs/common");
const features_controller_1 = require("./features.controller");
const features_service_1 = require("./features.service");
const features_repository_1 = require("./features.repository");
let FeaturesModule = class FeaturesModule {
};
exports.FeaturesModule = FeaturesModule;
exports.FeaturesModule = FeaturesModule = __decorate([
    (0, common_1.Module)({
        controllers: [features_controller_1.FeaturesController],
        providers: [features_service_1.FeaturesService, features_repository_1.FeaturesRepository],
        exports: [features_service_1.FeaturesService, features_repository_1.FeaturesRepository],
    })
], FeaturesModule);
//# sourceMappingURL=features.module.js.map