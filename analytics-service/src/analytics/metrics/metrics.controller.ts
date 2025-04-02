import { Controller, Get } from '@nestjs/common';

@Controller('metrics')
export class MetricsController {
  @Get()
  getMetrics() {
    return { message: 'Metrics endpoint works' };
  }
}

