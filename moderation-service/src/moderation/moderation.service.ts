import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ModerationRepository } from './moderation.repository';
import { ItemType, ModerationStatus } from '@prisma/client';
import { SubmitForModerationDto } from './dto/submit-for-moderation.dto';
import { ModerateItemDto } from './dto/moderate-item.dto';
import { QueryModerationItemsDto } from './dto/query-moderation-items.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);

  constructor(
    private moderationRepository: ModerationRepository,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async submitForModeration(
    dto: SubmitForModerationDto,
    submittedBy: string,
  ) {
    try {
      const newItem = await this.moderationRepository.createModerationItem({
        itemType: dto.itemType,
        itemId: dto.itemId,
        submittedBy,
        status: ModerationStatus.PENDING,
        reason: dto.reason,
        notes: dto.notes,
        history: {
          create: {
            status: ModerationStatus.PENDING,
            reason: dto.reason,
            notes: dto.notes,
          },
        },
      });

      return newItem;
    } catch (error) {
      this.logger.error(`Failed to submit for moderation: ${error.message}`);
      throw new BadRequestException(
        `Failed to submit for moderation: ${error.message}`,
      );
    }
  }

  async moderateItem(id: string, dto: ModerateItemDto, moderatedBy: string) {
    const item = await this.moderationRepository.findModerationItemById(id);
    if (!item) {
      throw new NotFoundException(`Moderation item with ID ${id} not found`);
    }

    // Create a new history entry
    const historyEntry = await this.moderationRepository.createModerationHistory({
      moderationItem: { connect: { id } },
      status: dto.status,
      reason: dto.reason,
      notes: dto.notes,
      moderatedBy,
    });

    // Update the moderation item
    const updatedItem = await this.moderationRepository.updateModerationItem(id, {
      status: dto.status,
      reason: dto.reason,
      notes: dto.notes,
      moderatedBy,
    });

    // Notify the appropriate service about the moderation decision
    await this.notifyServiceAboutModeration(updatedItem);

    return updatedItem;
  }

  private async notifyServiceAboutModeration(item: any) {
    try {
      // Determine which service to notify based on item type
      let serviceUrl = '';
      switch (item.itemType) {
        case ItemType.LOCATION:
          serviceUrl = `${this.configService.get<string>('LOCATION_SERVICE_URL')}/locations/moderation/${item.itemId}`;
          break;
        case ItemType.FILE:
          serviceUrl = `${this.configService.get<string>('FILE_SERVICE_URL')}/files/moderation/${item.itemId}`;
          break;
        case ItemType.USER:
          serviceUrl = `${this.configService.get<string>('USER_SERVICE_URL')}/users/moderation/${item.itemId}`;
          break;
        // Add other item types as needed
        default:
          this.logger.warn(`No service handling for item type: ${item.itemType}`);
          return;
      }

      // Send notification to the appropriate service
      if (serviceUrl) {
        await firstValueFrom(
          this.httpService.post(serviceUrl, {
            id: item.itemId,
            status: item.status,
            reason: item.reason,
            moderatedBy: item.moderatedBy,
          }),
        );
        this.logger.log(`Notified service about moderation decision: ${item.itemId} - ${item.status}`);
      }
    } catch (error) {
      this.logger.error(`Failed to notify service about moderation: ${error.message}`);
      // Don't throw, as this is an internal notification that shouldn't fail the main operation
    }
  }

  async getModerationItem(id: string) {
    const item = await this.moderationRepository.findModerationItemById(id);
    if (!item) {
      throw new NotFoundException(`Moderation item with ID ${id} not found`);
    }
    return item;
  }

  async getItemModerationHistory(itemType: ItemType, itemId: string) {
    return this.moderationRepository.findModerationItemsByItemId(itemType, itemId);
  }

  async queryModerationItems(query: QueryModerationItemsDto) {
    const { status, itemType, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (itemType) {
      where.itemType = itemType;
    }

    const [items, total] = await Promise.all([
      this.moderationRepository.findModerationItems({
        skip,
        take: limit,
        where,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.moderationRepository.countModerationItems(where),
    ]);

    return {
      items,
      total,
      page,
      limit,
    };
  }
}
