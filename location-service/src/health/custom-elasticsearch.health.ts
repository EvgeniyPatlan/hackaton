import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CustomElasticsearchHealthIndicator extends HealthIndicator {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async pingCheck(key: string, options: { timeout?: number } = {}): Promise<HealthIndicatorResult> {
    const timeout = options.timeout || 5000;
    const url = this.configService.get<string>('ELASTICSEARCH_URL') || 'http://elasticsearch:9200';

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${url}/_cluster/health`, { timeout }),
      );
      return this.getStatus(key, true, { status: response.data.status });
    } catch (error) {
      return this.getStatus(key, false, { message: error.message });
    }
  }
}
