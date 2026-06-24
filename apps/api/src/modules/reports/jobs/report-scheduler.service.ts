import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class ReportSchedulerService {
  private readonly logger = new Logger(ReportSchedulerService.name);

  constructor(
    @InjectQueue('reports') private readonly reportsQueue: Queue,
  ) {}

  async scheduleReport(options: {
    type: 'full-kpi-report' | 'comparative-report' | 'transport-vs-sales-report';
    companyId: string;
    userId: string;
    cron: string;
    params?: Record<string, any>;
  }) {
    const jobId = `${options.type}-${options.companyId}-${options.cron.replace(/[^a-zA-Z0-9]/g, '_')}`;
    this.logger.log(`Scheduling ${options.type} with cron "${options.cron}" (jobId: ${jobId})`);

    const existing = await this.reportsQueue.getJobScheduler(jobId);
    if (existing) {
      this.logger.warn(`Job scheduler ${jobId} already exists, removing first`);
      await this.reportsQueue.removeJobScheduler(jobId);
    }

    await this.reportsQueue.upsertJobScheduler(
      jobId,
      { pattern: options.cron },
      {
        name: options.type,
        data: {
          companyId: options.companyId,
          userId: options.userId,
          params: options.params || {},
          scheduled: true,
        },
        opts: { removeOnComplete: 5, removeOnFail: 10 },
      },
    );

    this.logger.log(`Scheduled ${options.type} with cron "${options.cron}"`);
  }

  async cancelSchedule(jobSchedulerId: string) {
    this.logger.log(`Removing job scheduler: ${jobSchedulerId}`);
    await this.reportsQueue.removeJobScheduler(jobSchedulerId);
  }

  async listSchedules() {
    const schedulers = await this.reportsQueue.getJobSchedulers();
    return schedulers.map(s => ({
      id: s.id,
      name: s.name,
      pattern: s.pattern,
      next: s.next,
    }));
  }

  async triggerImmediate(options: {
    type: 'full-kpi-report' | 'comparative-report' | 'transport-vs-sales-report';
    companyId: string;
    userId: string;
    params?: Record<string, any>;
  }) {
    this.logger.log(`Enqueuing immediate ${options.type}`);
    await this.reportsQueue.add(options.type, {
      companyId: options.companyId,
      userId: options.userId,
      params: options.params || {},
      scheduled: false,
    });
  }
}
