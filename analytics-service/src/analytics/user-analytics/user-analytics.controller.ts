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
import { UserAnalyticsService } from './user-analytics.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UpdateUserStatsDto } from './dto/update-user-stats.dto';

@ApiTags('user-analytics')
@Controller('user-analytics')
export class UserAnalyticsController {
  constructor(private readonly userAnalyticsService: UserAnalyticsService) {}

  @Get('active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'analyst')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get most active users' })
  @ApiResponse({ status: 200, description: 'Return most active users.' })
  async getMostActiveUsers(@Query('limit') limit: number = 10) {
    return this.userAnalyticsService.getMostActiveUsers(limit);
  }

  @Get('active-count')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'analyst')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get active users count for a period' })
  @ApiResponse({ status: 200, description: 'Return active users count.' })
  async getActiveUsersCount(@Query('days') days: number = 30) {
    const count = await this.userAnalyticsService.getActiveUsersCount(days);
    return { count, period: `${days} days` };
  }

  @Get('total')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'analyst')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get total users count' })
  @ApiResponse({ status: 200, description: 'Return total users count.' })
  async getTotalUsers() {
    const count = await this.userAnalyticsService.getTotalUsers();
    return { total: count };
  }

  @Get(':userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'analyst', 'moderator')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get analytics for a specific user' })
  @ApiResponse({ status: 200, description: 'Return user analytics.' })
  async getUserAnalytics(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.userAnalyticsService.getUserAnalytics(userId);
  }

  @Post(':userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'analyst')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update statistics for a user' })
  @ApiResponse({ status: 200, description: 'User statistics updated.' })
  async updateUserStats(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updateStatsDto: UpdateUserStatsDto,
  ) {
    return this.userAnalyticsService.updateUserStats(userId, updateStatsDto);
  }
}
