import {
  Controller,
  Get,
  Put,
  Body,
  Post,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PreferenceService } from './preference.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
import { GetUser } from './guards/get-user.decorator';

@Controller('preferences')
export class PreferenceController {
  constructor(private readonly preferenceService: PreferenceService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getPreferences(@GetUser() user: any) {
    return this.preferenceService.getUserPreference(user.id);
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  async updatePreferences(
    @GetUser() user: any,
    @Body() dto: UpdatePreferenceDto,
  ) {
    return this.preferenceService.updatePreference(user.id, dto);
  }

  @Post('devices')
  @UseGuards(JwtAuthGuard)
  async addDeviceToken(
    @GetUser() user: any,
    @Body('token') token: string,
  ) {
    return this.preferenceService.addDeviceToken(user.id, token);
  }

  @Delete('devices/:token')
  @UseGuards(JwtAuthGuard)
  async removeDeviceToken(
    @GetUser() user: any,
    @Param('token') token: string,
  ) {
    return this.preferenceService.removeDeviceToken(user.id, token);
  }
}
