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
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { FilterLocationsDto } from './dto/filter-locations.dto';

// Імпорти для JWT Guard мають бути реалізовані у вашому проекті
// Тут використовуємо заглушку для JWT Guard
class JwtAuthGuard {}

@ApiTags('locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @ApiOperation({ summary: 'Отримати всі локації' })
  @ApiResponse({
    status: 200,
    description: 'Список локацій успішно отримано',
  })
  @Get()
  async findAll(@Query() filterDto: FilterLocationsDto) {
    return this.locationsService.findAll(filterDto);
  }

  @ApiOperation({ summary: 'Отримати локацію за ID' })
  @ApiParam({ name: 'id', description: 'ID локації' })
  @ApiQuery({
    name: 'includeFeatures',
    required: false,
    type: Boolean,
    description: 'Чи включати елементи безбар\'єрності',
  })
  @ApiResponse({
    status: 200,
    description: 'Локацію успішно знайдено',
  })
  @ApiResponse({ status: 404, description: 'Локацію не знайдено' })
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('includeFeatures') includeFeatures: boolean,
  ) {
    return this.locationsService.findById(id, includeFeatures);
  }

  @ApiOperation({ summary: 'Створити нову локацію' })
  @ApiResponse({
    status: 201,
    description: 'Локацію успішно створено',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createLocationDto: CreateLocationDto, @Request() req) {
    // req.user.id має бути доступним після проходження JwtAuthGuard
    const userId = req.user?.id || 'system';
    return this.locationsService.create(createLocationDto, userId);
  }

  @ApiOperation({ summary: 'Оновити локацію' })
  @ApiParam({ name: 'id', description: 'ID локації' })
  @ApiResponse({
    status: 200,
    description: 'Локацію успішно оновлено',
  })
  @ApiResponse({ status: 404, description: 'Локацію не знайдено' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
    @Request() req,
  ) {
    const userId = req.user?.id || 'system';
    return this.locationsService.update(id, updateLocationDto, userId);
  }

  @ApiOperation({ summary: 'Видалити локацію' })
  @ApiParam({ name: 'id', description: 'ID локації' })
  @ApiResponse({
    status: 204,
    description: 'Локацію успішно видалено',
  })
  @ApiResponse({ status: 404, description: 'Локацію не знайдено' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.locationsService.delete(id);
  }

  @ApiOperation({ summary: 'Оновити статус локації' })
  @ApiParam({ name: 'id', description: 'ID локації' })
  @ApiResponse({
    status: 200,
    description: 'Статус локації успішно оновлено',
  })
  @ApiResponse({ status: 404, description: 'Локацію не знайдено' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.locationsService.updateStatus(id, status);
  }

  @ApiOperation({ summary: 'Оновити оцінку доступності локації' })
  @ApiParam({ name: 'id', description: 'ID локації' })
  @ApiResponse({
    status: 200,
    description: 'Оцінку доступності локації успішно оновлено',
  })
  @ApiResponse({ status: 404, description: 'Локацію не знайдено' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/score')
  async updateScore(
    @Param('id') id: string,
    @Body('score') score: number,
  ) {
    return this.locationsService.updateAccessibilityScore(id, score);
  }

  @ApiOperation({ summary: 'Отримати локації за організацією' })
  @ApiParam({ name: 'organizationId', description: 'ID організації' })
  @ApiResponse({
    status: 200,
    description: 'Список локацій організації успішно отримано',
  })
  @Get('by-organization/:organizationId')
  async findByOrganization(@Param('organizationId') organizationId: string) {
    return this.locationsService.findByOrganization(organizationId);
  }

  @ApiOperation({ summary: 'Отримати локації за користувачем' })
  @ApiResponse({
    status: 200,
    description: 'Список локацій користувача успішно отримано',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('by-user/me')
  async findByCurrentUser(@Request() req) {
    const userId = req.user?.id;
    return this.locationsService.findByUser(userId);
  }
}
