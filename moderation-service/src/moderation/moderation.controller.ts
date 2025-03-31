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
import { ModerationService } from './moderation.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './guards/roles.decorator';
import { SubmitForModerationDto } from './dto/submit-for-moderation.dto';
import { ModerateItemDto } from './dto/moderate-item.dto';
import { QueryModerationItemsDto } from './dto/query-moderation-items.dto';
import { GetUser } from './guards/get-user.decorator';
import { ItemType } from '@prisma/client';

@Controller('moderation')
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Post('submit')
  @UseGuards(JwtAuthGuard)
  async submitForModeration(
    @Body() dto: SubmitForModerationDto,
    @GetUser() user: any,
  ) {
    return this.moderationService.submitForModeration(dto, user.id);
  }

  @Put(':id')
  @Roles('ADMIN', 'MODERATOR')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async moderateItem(
    @Param('id') id: string,
    @Body() dto: ModerateItemDto,
    @GetUser() user: any,
  ) {
    return this.moderationService.moderateItem(id, dto, user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getModerationItem(@Param('id') id: string) {
    return this.moderationService.getModerationItem(id);
  }

  @Get('item/:itemType/:itemId')
  @UseGuards(JwtAuthGuard)
  async getItemModerationHistory(
    @Param('itemType') itemType: ItemType,
    @Param('itemId') itemId: string,
  ) {
    return this.moderationService.getItemModerationHistory(itemType, itemId);
  }

  @Get()
  @Roles('ADMIN', 'MODERATOR')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async queryModerationItems(@Query() query: QueryModerationItemsDto) {
    return this.moderationService.queryModerationItems(query);
  }
}
