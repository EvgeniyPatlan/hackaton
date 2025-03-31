import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  ParseUUIDPipe,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { QueryEventsDto } from './dto/query-events.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { GetUser } from '../decorators/get-user.decorator';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Track a new analytics event' })
  @ApiResponse({ status: 201, description: 'The event has been successfully tracked.' })
  async trackEvent(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.trackEvent(createEventDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'analyst')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get analytics events with filtering' })
  @ApiResponse({ status: 200, description: 'Return the filtered events.' })
  async getEvents(@Query() queryDto: QueryEventsDto) {
    return this.eventsService.getEvents(queryDto);
  }

  @Get('statistics/:eventType')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'analyst')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get statistics for a specific event type' })
  @ApiResponse({ status: 200, description: 'Return the event statistics.' })
  async getEventStatistics(
    @Param('eventType') eventType: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.eventsService.getEventStatistics(
      eventType,
      new Date(startDate || new Date().setDate(new Date().getDate() - 30)),
      new Date(endDate || new Date()),
    );
  }
}
