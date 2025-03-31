import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './guards/roles.decorator';
import { CreateReportDto } from './dto/create-report.dto';
import { ResolveReportDto } from './dto/resolve-report.dto';
import { QueryReportsDto } from './dto/query-reports.dto';
import { GetUser } from './guards/get-user.decorator';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createReport(
    @Body() dto: CreateReportDto,
    @GetUser() user: any,
  ) {
    return this.reportService.createReport(dto, user.id);
  }

  @Put(':id/resolve')
  @Roles('ADMIN', 'MODERATOR')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async resolveReport(
    @Param('id') id: string,
    @Body() dto: ResolveReportDto,
    @GetUser() user: any,
  ) {
    return this.reportService.resolveReport(id, dto, user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getReport(@Param('id') id: string) {
    return this.reportService.getReport(id);
  }

  @
cat > moderation-service/src/moderation/report.controller.ts << 'EOF'
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './guards/roles.decorator';
import { CreateReportDto } from './dto/create-report.dto';
import { ResolveReportDto } from './dto/resolve-report.dto';
import { QueryReportsDto } from './dto/query-reports.dto';
import { GetUser } from './guards/get-user.decorator';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createReport(
    @Body() dto: CreateReportDto,
    @GetUser() user: any,
  ) {
    return this.reportService.createReport(dto, user.id);
  }

  @Put(':id/resolve')
  @Roles('ADMIN', 'MODERATOR')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async resolveReport(
    @Param('id') id: string,
    @Body() dto: ResolveReportDto,
    @GetUser() user: any,
  ) {
    return this.reportService.resolveReport(id, dto, user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getReport(@Param('id') id: string) {
    return this.reportService.getReport(id);
  }

  @Get()
  @Roles('ADMIN', 'MODERATOR')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async queryReports(@Query() query: QueryReportsDto) {
    return this.reportService.queryReports(query);
  }
}
