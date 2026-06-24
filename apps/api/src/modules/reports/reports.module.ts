import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { PdfGeneratorService } from './pdf/pdf-generator.service';
import { PdfRendererService } from './pdf/pdf-renderer.service';
import { ReportSchedulerService } from './jobs/report-scheduler.service';
import { ReportSchedulerInitService } from './jobs/report-scheduler-init.service';
import { ReportProcessor } from './jobs/report-processor.service';
import { TransportModule } from '../transport/transport.module';
import { KpiModule } from '../kpi/kpi.module';

@Module({
  imports: [
    TransportModule,
    KpiModule,
    BullModule.registerQueue({ name: 'reports' }),
  ],
  controllers: [ReportsController],
  providers: [
    ReportsService,
    PdfGeneratorService,
    PdfRendererService,
    ReportSchedulerService,
    ReportProcessor,
    ReportSchedulerInitService,
  ],
  exports: [ReportsService, ReportSchedulerService],
})
export class ReportsModule {}
