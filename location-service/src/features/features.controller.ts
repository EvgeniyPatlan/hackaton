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
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FeaturesService } from './features.service';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';
import { FilterFeaturesDto } from './dto/filter-features.dto';
import { AccessibilityFeature } from '../types/models';

// Імпорти для JWT Guard мають бути реалізовані у вашому проекті
// Тут використовуємо заглушку для JWT Guard
class JwtAuthGuard {}

@ApiTags('features')
@Controller('locations/:locationId/features')
export class FeaturesController {
  constructor(private readonly featuresService: FeaturesService) {}

  @ApiOperation({ summary: 'Отримати всі елементи безбар\'єрності для локації' })
  @ApiParam({ name: 'locationId', description: 'ID локації' })
  @ApiResponse({
    status: 200,
    description: 'Список елементів безбар\'єрності успішно отримано',
  })
  @ApiResponse({ status: 404, description: 'Локацію не знайдено' })
  @Get()
  async findAll(
    @Param('locationId') locationId: string,
    @Query() filterDto: FilterFeaturesDto,
  ) {
    return this.featuresService.findAllByLocation(locationId, filterDto);
  }

  @ApiOperation({ summary: 'Отримати елемент безбар\'єрності за ID' })
  @ApiParam({ name: 'locationId', description: 'ID локації' })
  @ApiParam({ name: 'id', description: 'ID елементу безбар\'єрності' })
  @ApiResponse({
    status: 200,
    description: 'Елемент безбар\'єрності успішно знайдено',
  })
  @ApiResponse({ status: 404, description: 'Елемент безбар\'єрності не знайдено' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.featuresService.findById(id);
  }

  @ApiOperation({ summary: 'Створити новий елемент безбар\'єрності' })
  @ApiParam({ name: 'locationId', description: 'ID локації' })
  @ApiResponse({
    status: 201,
    description: 'Елемент безбар\'єрності успішно створено',
  })
  @ApiResponse({ status: 404, description: 'Локацію не знайдено' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Param('locationId') locationId: string,
    @Body() createFeatureDto: CreateFeatureDto,
    @Request() req,
  ):  Promise<AccessibilityFeature> {
    // req.user.id має бути доступним після проходження JwtAuthGuard
    const userId = req.user?.id || 'system';
    return this.featuresService.create(locationId, createFeatureDto, userId);
  }

  @ApiOperation({ summary: 'Оновити елемент безбар\'єрності' })
  @ApiParam({ name: 'locationId', description: 'ID локації' })
  @ApiParam({ name: 'id', description: 'ID елементу безбар\'єрності' })
  @ApiResponse({
    status: 200,
    description: 'Елемент безбар\'єрності успішно оновлено',
  })
  @ApiResponse({ status: 404, description: 'Елемент безбар\'єрності не знайдено' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateFeatureDto: UpdateFeatureDto,
  ): Promise<AccessibilityFeature> {
    return this.featuresService.update(id, updateFeatureDto);
  }

  @ApiOperation({ summary: 'Видалити елемент безбар\'єрності' })
  @ApiParam({ name: 'locationId', description: 'ID локації' })
  @ApiParam({ name: 'id', description: 'ID елементу безбар\'єрності' })
  @ApiResponse({
    status: 204,
    description: 'Елемент безбар\'єрності успішно видалено',
  })
  @ApiResponse({ status: 404, description: 'Елемент безбар\'єрності не знайдено' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.featuresService.delete(id);
  }
}
