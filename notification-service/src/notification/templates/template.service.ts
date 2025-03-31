import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NotificationRepository } from '../notification.repository';
import { CreateTemplateDto } from '../dto/create-template.dto';
import { UpdateTemplateDto } from '../dto/update-template.dto';
import * as Handlebars from 'handlebars';

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);
  private readonly compiledTemplates = new Map<string, any>();

  constructor(private notificationRepository: NotificationRepository) {
    // Register Handlebars helpers
    Handlebars.registerHelper('formatDate', function(date, format) {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleDateString('uk-UA');
    });
  }

  async getTemplate(name: string) {
    const template = await this.notificationRepository.findTemplate(name);
    if (!template) {
      throw new NotFoundException(`Template ${name} not found`);
    }
    return template;
  }

  async createTemplate(dto: CreateTemplateDto) {
    // Validate template by trying to compile it
    try {
      Handlebars.compile(dto.textBody);
      if (dto.htmlBody) {
        Handlebars.compile(dto.htmlBody);
      }
    } catch (error) {
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

  async updateTemplate(id: string, dto: UpdateTemplateDto) {
    // Validate template by trying to compile it
    if (dto.textBody) {
      try {
        Handlebars.compile(dto.textBody);
      } catch (error) {
        this.logger.error(`Invalid text template: ${error.message}`);
        throw new Error(`Invalid text template: ${error.message}`);
      }
    }

    if (dto.htmlBody) {
      try {
        Handlebars.compile(dto.htmlBody);
      } catch (error) {
        this.logger.error(`Invalid HTML template: ${error.message}`);
        throw new Error(`Invalid HTML template: ${error.message}`);
      }
    }

    return this.notificationRepository.updateTemplate(id, dto);
  }

  async getAllTemplates() {
    return this.notificationRepository.findAllTemplates();
  }

  async processTemplate(name: string, data: Record<string, any>) {
    try {
      const template = await this.getTemplate(name);
      
      // Compile templates if not already cached
      if (!this.compiledTemplates.has(`${name}_text`)) {
        this.compiledTemplates.set(
          `${name}_text`,
          Handlebars.compile(template.textBody),
        );
      }
      
      if (template.htmlBody && !this.compiledTemplates.has(`${name}_html`)) {
        this.compiledTemplates.set(
          `${name}_html`,
          Handlebars.compile(template.htmlBody),
        );
      }
      
      // Process templates
      const textTemplate = this.compiledTemplates.get(`${name}_text`);
      const htmlTemplate = this.compiledTemplates.get(`${name}_html`);
      
      const result = {
        subject: template.subject,
        message: textTemplate(data),
        html: htmlTemplate ? htmlTemplate(data) : null,
      };
      
      return result;
    } catch (error) {
      this.logger.error(`Failed to process template ${name}: ${error.message}`);
      return null;
    }
  }
}
