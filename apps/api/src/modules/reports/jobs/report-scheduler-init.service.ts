import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ReportSchedulerService } from './report-scheduler.service';

@Injectable()
export class ReportSchedulerInitService implements OnModuleInit {
  private readonly logger = new Logger(ReportSchedulerInitService.name);

  constructor(private readonly scheduler: ReportSchedulerService) {}

  async onModuleInit() {
    this.logger.log('ReportSchedulerInitService initialized — ready to schedule reports');
  }
}
