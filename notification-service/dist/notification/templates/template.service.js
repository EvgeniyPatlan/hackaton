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
var TemplateService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateService = void 0;
const common_1 = require("@nestjs/common");
const notification_repository_1 = require("../notification.repository");
const Handlebars = require("handlebars");
let TemplateService = TemplateService_1 = class TemplateService {
    constructor(notificationRepository) {
        this.notificationRepository = notificationRepository;
        this.logger = new common_1.Logger(TemplateService_1.name);
        this.compiledTemplates = new Map();
        Handlebars.registerHelper('formatDate', function (date, format) {
            if (!date)
                return '';
            const d = new Date(date);
            return d.toLocaleDateString('uk-UA');
        });
    }
    async getTemplate(name) {
        const template = await this.notificationRepository.findTemplate(name);
        if (!template) {
            throw new common_1.NotFoundException(`Template ${name} not found`);
        }
        return template;
    }
    async createTemplate(dto) {
        try {
            Handlebars.compile(dto.textBody);
            if (dto.htmlBody) {
                Handlebars.compile(dto.htmlBody);
            }
        }
        catch (error) {
            this.logger.error(`Invalid template: ${error.message}`);
            throw new Error(`Invalid template: ${error.message}`);
        }
        return this.notificationRepository.createTemplate({
            name: dto.name,
            type: dto.type,
            subject: dto.subject,
            htmlBody: dto.htmlBody,
            textBody: dto.textBody,
        });
    }
    async updateTemplate(id, dto) {
        if (dto.textBody) {
            try {
                Handlebars.compile(dto.textBody);
            }
            catch (error) {
                this.logger.error(`Invalid text template: ${error.message}`);
                throw new Error(`Invalid text template: ${error.message}`);
            }
        }
        if (dto.htmlBody) {
            try {
                Handlebars.compile(dto.htmlBody);
            }
            catch (error) {
                this.logger.error(`Invalid HTML template: ${error.message}`);
                throw new Error(`Invalid HTML template: ${error.message}`);
            }
        }
        return this.notificationRepository.updateTemplate(id, dto);
    }
    async getAllTemplates() {
        return this.notificationRepository.findAllTemplates();
    }
    async processTemplate(name, data) {
        try {
            const template = await this.getTemplate(name);
            if (!this.compiledTemplates.has(`${name}_text`)) {
                this.compiledTemplates.set(`${name}_text`, Handlebars.compile(template.textBody));
            }
            if (template.htmlBody && !this.compiledTemplates.has(`${name}_html`)) {
                this.compiledTemplates.set(`${name}_html`, Handlebars.compile(template.htmlBody));
            }
            const textTemplate = this.compiledTemplates.get(`${name}_text`);
            const htmlTemplate = this.compiledTemplates.get(`${name}_html`);
            const result = {
                subject: template.subject,
                message: textTemplate(data),
                html: htmlTemplate ? htmlTemplate(data) : null,
            };
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to process template ${name}: ${error.message}`);
            return null;
        }
    }
};
exports.TemplateService = TemplateService;
exports.TemplateService = TemplateService = TemplateService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notification_repository_1.NotificationRepository])
], TemplateService);
//# sourceMappingURL=template.service.js.map