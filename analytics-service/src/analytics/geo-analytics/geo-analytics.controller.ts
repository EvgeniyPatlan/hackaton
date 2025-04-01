import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GeoAnalyticsService } from './geo-analytics.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

// Локальний інтерфейс для трендів регіонів
interface RegionalTrendResult {
  regionName: string;
  unique_users: number;
  total_views: number;
}

@ApiTags('geo-analytics')
@Controller('geo-analytics')
export class GeoAnalyticsController {
  constructor(private readonly geoAnalyticsService: GeoAnalyticsService) {}

  @Get('regions/top')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'analyst')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get top regions by location count' })
  @ApiResponse({ status: 200, description: 'Return top regions.' })
  async getTopRegions(@Query('limit') limit: number = 5) {
    return this.geoAnalyticsService.getTopRegions(limit);
  }

  @Get('cities/top')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'analyst')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get top cities by location count' })
  @ApiResponse({ status: 200, description: 'Return top cities.' })
  async getTopCities(@Query('limit') limit: number = 5) {
    return this.geoAnalyticsService.getTopCities(limit);
  }

  @Get('regions/:regionName')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'analyst')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get statistics for a specific region' })
  @ApiResponse({ status: 200, description: 'Return region statistics.' })
  async getRegionStatistics(@Param('regionName') regionName: string) {
    return this.geoAnalyticsService.getRegionStatistics(regionName);
  }

  @Get('accessibility/by-region')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'analyst')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get accessibility statistics by region' })
  @ApiResponse({ status: 200, description: 'Return accessibility statistics by region.' })
  async getAccessibilityStatsByRegion() {
    return this.geoAnalyticsService.getAccessibilityStatsByRegion();
  }

  @Get('trends/regional')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'analyst')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get regional trends analysis' })
  @ApiResponse({ status: 200, description: 'Return regional trends analysis.' })
  async getRegionalTrends(): Promise<RegionalTrendResult[]> {
    return this.geoAnalyticsService.analyzeRegionalTrends();
  }
}