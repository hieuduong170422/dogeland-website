import { Controller, Get } from '@nestjs/common';
import { ServerStatusService } from './server-status.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('server-status')
@Public()
export class ServerStatusController {
  constructor(private readonly service: ServerStatusService) {}

  @Get()
  getStatus() {
    return this.service.getStatus();
  }

  @Get('history')
  getHistory() {
    return this.service.getStatsHistory();
  }
}
