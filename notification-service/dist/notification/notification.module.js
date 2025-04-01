"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const notification_controller_1 = require("./notification.controller");
const notification_service_1 = require("./notification.service");
const email_service_1 = require("./providers/email.service");
const push_service_1 = require("./providers/push.service");
const sms_service_1 = require("./providers/sms.service");
const template_service_1 = require("./templates/template.service");
const notification_repository_1 = require("./notification.repository");
const preference_controller_1 = require("./preference.controller");
const preference_service_1 = require("./preference.service");
const prisma_module_1 = require("../prisma/prisma.module");
const template_controller_1 = require("./templates/template.controller");
let NotificationModule = class NotificationModule {
};
exports.NotificationModule = NotificationModule;
exports.NotificationModule = NotificationModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, axios_1.HttpModule],
        controllers: [notification_controller_1.NotificationController, preference_controller_1.PreferenceController, template_controller_1.TemplateController],
        providers: [
            notification_service_1.NotificationService,
            email_service_1.EmailService,
            push_service_1.PushService,
            sms_service_1.SmsService,
            template_service_1.TemplateService,
            notification_repository_1.NotificationRepository,
            preference_service_1.PreferenceService,
        ],
        exports: [notification_service_1.NotificationService, preference_service_1.PreferenceService],
    })
], NotificationModule);
//# sourceMappingURL=notification.module.js.map