import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardsService {
  getData() {
    return { message: 'Dashboards service data' };
  }
}

