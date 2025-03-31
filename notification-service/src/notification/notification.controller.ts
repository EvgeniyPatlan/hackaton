import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseBoolPipe,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { GetUser } from './guards/get-user.decorator';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createNotification(@Body() dto: CreateNotificationDto) {
    return this.notificationService.createNotification(dto);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyNotifications(
    @GetUser() user: any,
    @Query('unread', new DefaultValuePipe(false), ParseBoolPipe) unread: boolean,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.notificationService.getUserNotifications(user.id, unread, page, limit);
  }

  @Post('read/:id')
  @UseGuards(JwtAuthGuard)
  async markAsRead(@Param('id') id: string, @GetUser() user: any) {
    return this.notificationService.markAsRead(id, user.id);
  }

  @Post('read-all')
  @UseGuards(JwtAuthGuard)
  async markAllAsRead(@GetUser() user: any) {
    return this.notificationService.markAllAsRead(user.id);
  }
}
