import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LocationAnalyticsService } from './location-analytics.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UpdateLocationStatsDto } from './dto/update-location-stats.dto';

@ApiTags('location-analytics')
@Controller('location-analytics')
export class LocationAnalyticsController {
  constructor(private readonly locationAnalyticsService: LocationAnalyticsService) {}

  @Get('top')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'analyst')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get top locations by popularity' })
  @ApiResponse({ status: 200, description: 'Return top locations.' })
  async getTopLocations(@Query('limit') limit: number = 10) {
    return this.locationAnalyticsService.getTopLocations(limit);
  }

  @Get(':locationId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'analyst', 'moderator')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get analytics for a specific location' })
  @ApiResponse({ status: 200, description: 'Return location analytics.' })
  async getLocationAnalytics(@Param('locationId', ParseUUIDPipe) locationId: string) {
    return this.locationAnalyticsService.getLocationAnalytics(locationId);
  }

  @Post(':locationId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'analyst')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update statistics for a location' })
  @ApiResponse({ status: 200, description: 'Location statistics updated.' })
  async updateLocationStats(
    @Param('locationId', ParseUUIDPipe) locationId: string,
    @Body() updateStatsDto: UpdateLocationStatsDto,
  ) {
    return this.locationAnalyticsService.updateLocationStats(locationId, updateStatsDto);
  }

  @Get('total/count')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'analyst', 'moderator')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get total number of locations' })
  @ApiResponse({ status: 200, description: 'Return total locations count.' })
  async getTotalLocations() {
    const count = await this.locationAnalyticsService.getTotalLocations();
    return { total: count };
  }
}
