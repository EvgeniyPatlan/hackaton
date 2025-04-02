import { Controller, Get } from '@nestjs/common';

@Controller('dashboards')
export class DashboardsController {
  @Get()
  getAll() {
    return { message: 'Dashboards endpoint works' };
  }
}

