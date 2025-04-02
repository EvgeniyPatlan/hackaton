import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { QueryReportsDto } from './dto/query-reports.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { GetUser } from '../decorators/get-user.decorator';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Create a new report' })
  @ApiResponse({ status: 201, description: 'Report created successfully.' })
  async createReport(@Body() createReportDto: CreateReportDto, @GetUser('sub') userId: string) {
    return this.reportsService.createReport(createReportDto, userId);
  }

  @Get()
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Get all reports with filtering' })
  @ApiResponse({ status: 200, description: 'Return the filtered reports.' })
  async getReports(@Query() queryDto: QueryReportsDto) {
    return this.reportsService.getReports(queryDto);
  }

  @Get(':id')
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Get a report by ID' })
  @ApiResponse({ status: 200, description: 'Return the report.' })
  async getReportById(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportsService.getReportById(id);
  }

  @Patch(':id')
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Update a report' })
  @ApiResponse({ status: 200, description: 'Report updated successfully.' })
  async updateReport(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReportDto: UpdateReportDto,
  ) {
    return this.reportsService.updateReport(id, updateReportDto);
  }

  @Delete(':id')
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Delete a report' })
  @ApiResponse({ status: 200, description: 'Report deleted successfully.' })
  async deleteReport(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportsService.deleteReport(id);
  }

  @Post(':id/run')
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Run a report manually' })
  @ApiResponse({ status: 200, description: 'Report run successfully.' })
  async runReport(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportsService.runReport(id);
  }

  @Post('generate/:type')
  @Roles('admin')
  @ApiOperation({ summary: 'Generate reports by type (daily, weekly, monthly)' })
  @ApiResponse({ status: 200, description: 'Reports generated successfully.' })
  async generateReports(@Param('type') type: string) {
    return this.reportsService.generateScheduledReports(type);
  }
}
