import { Injectable, Logger } from '@nestjs/common';
import { AnalyticsRepository } from '../analytics.repository';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { QueryReportsDto } from './dto/query-reports.dto';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async createReport(createReportDto: CreateReportDto, userId: string) {
    try {
      return this.analyticsRepository.createReport({
        name: createReportDto.name,
        description: createReportDto.description,
        type: createReportDto.type,
        query: createReportDto.query,
        schedule: createReportDto.schedule,
        creatorId: userId,
      });
    } catch (error) {
      this.logger.error(`Error creating report: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getReports(queryDto: QueryReportsDto) {
    try {
      const { skip, take, type, creatorId } = queryDto;

      const where: any = {};
      
      if (type) {
        where.type = type;
      }
      
      if (creatorId) {
        where.creatorId = creatorId;
      }

      const reports = await this.analyticsRepository.findReports({
        skip,
        take,
        where,
        orderBy: { createdAt: 'desc' },
      });

      return reports;
    } catch (error) {
      this.logger.error(`Error getting reports: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getReportById(id: string) {
    try {
      return this.analyticsRepository.findReportById(id);
    } catch (error) {
      this.logger.error(`Error getting report by ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateReport(id: string, updateReportDto: UpdateReportDto) {
    try {
      return this.analyticsRepository.updateReport(id, updateReportDto);
    } catch (error) {
      this.logger.error(`Error updating report: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteReport(id: string) {
    try {
      return this.analyticsRepository.deleteReport(id);
    } catch (error) {
      this.logger.error(`Error deleting report: ${error.message}`, error.stack);
      throw error;
    }
  }

  async generateScheduledReports(type: string) {
    try {
      // Отримати звіти з вказаним типом розкладу
      const reports = await this.analyticsRepository.findReports({
        where: {
          type,
          isActive: true,
        },
      });

      this.logger.log(`Found ${reports.length} ${type} reports to generate`);

      // Генеруємо кожен звіт
      for (const report of reports) {
        try {
          // Виконуємо запит, визначений у звіті
          const queryParams = report.query as any;
          
          // Визначаємо часові рамки для звіту
          const endDate = new Date();
          let startDate: Date;
          
          if (type === 'daily') {
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 1);
          } else if (type === 'weekly') {
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);
          } else if (type === 'monthly') {
            startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 1);
          } else {
            startDate = new Date(queryParams.startDate || endDate.setDate(endDate.getDate() - 30));
          }
          
          // Підготовка параметрів запиту
          const parameters = [
            startDate,
            endDate,
            ...(queryParams.extraParams || []),
          ];
          
          // Виконання запиту
          const result = await this.analyticsRepository.executeRawQuery(
            queryParams.query,
            parameters,
          );
          
          // Оновлюємо інформацію про час останнього запуску
          await this.analyticsRepository.updateReport(report.id, {
            lastRunAt: new Date(),
          });
          
          // Тут можна зберегти результат виконання звіту, відправити email і т.д.
          this.logger.log(`Report ${report.name} generated successfully with ${result.length} rows`);
        } catch (error) {
          this.logger.error(`Error generating report ${report.id}: ${error.message}`, error.stack);
        }
      }
      
      return { success: true, reportsCount: reports.length };
    } catch (error) {
      this.logger.error(`Error generating scheduled reports: ${error.message}`, error.stack);
      throw error;
    }
  }

  async runReport(id: string) {
    try {
      const report = await this.analyticsRepository.findReportById(id);
      
      if (!report) {
        throw new Error(`Report with ID ${id} not found`);
      }
      
      // Виконуємо запит, визначений у звіті
      const queryParams = report.query as any;
      const result = await this.analyticsRepository.executeRawQuery(
        queryParams.query,
        queryParams.parameters || [],
      );
      
      // Оновлюємо інформацію про час останнього запуску
      await this.analyticsRepository.updateReport(id, {
        lastRunAt: new Date(),
      });
      
      return {
        reportName: report.name,
        generatedAt: new Date(),
        result,
      };
    } catch (error) {
      this.logger.error(`Error running report: ${error.message}`, error.stack);
      throw error;
    }
  }
}
