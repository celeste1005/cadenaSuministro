import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { ReportsService } from '../reports.service';
import { EmailService } from '../../notifications/email/email.service';

@Processor('reports')
export class ReportProcessor extends WorkerHost {
  private readonly logger = new Logger(ReportProcessor.name);

  constructor(
    private readonly reportsService: ReportsService,
    private readonly emailService: EmailService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.name} (id: ${job.id})`);

    switch (job.name) {
      case 'transport-vs-sales-report':
        return this.handleTransportReport(job);
      case 'full-kpi-report':
        return this.handleFullKpiReport(job);
      case 'comparative-report':
        return this.handleComparativeReport(job);
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  private async handleTransportReport(job: Job) {
    const { companyId, year, recipients, userId } = job.data;
    this.logger.log(`Generating transport report for company ${companyId}, year ${year}`);

    const pdfBuffer = await this.reportsService.generateTransportKpiReport(companyId, year || new Date().getFullYear(), userId);

    await this.sendIfRecipients(pdfBuffer, recipients, `reporte-transporte-${year}.pdf`);
    return { success: true, generatedAt: new Date() };
  }

  private async handleFullKpiReport(job: Job) {
    const { companyId, userId, params = {}, recipients } = job.data;
    const { period = 'monthly', year = new Date().getFullYear(), month, quarter } = params;

    this.logger.log(`Generating full KPI report for company ${companyId}, ${period} ${year}`);

    const pdfBuffer = await this.reportsService.generateFullKpiReport(
      companyId,
      period,
      year,
      userId,
      month ? parseInt(month) : undefined,
      quarter ? parseInt(quarter) : undefined,
    );

    const filename = `reporte-kpis-${period}-${year}.pdf`;
    await this.sendIfRecipients(pdfBuffer, recipients, filename);
    return { success: true, generatedAt: new Date() };
  }

  private async handleComparativeReport(job: Job) {
    const { companyId, userId, params = {}, recipients } = job.data;
    const { year = new Date().getFullYear() } = params;

    this.logger.log(`Generating comparative report for company ${companyId}, year ${year}`);

    const pdfBuffer = await this.reportsService.generateComparativeReport(
      companyId,
      year,
      userId,
    );

    const filename = `reporte-comparativo-${year}.pdf`;
    await this.sendIfRecipients(pdfBuffer, recipients, filename);
    return { success: true, generatedAt: new Date() };
  }

  private async sendIfRecipients(pdfBuffer: Buffer, recipients: string[] | undefined, filename: string) {
    if (recipients && recipients.length > 0) {
      this.logger.log(`Sending ${filename} to ${recipients.length} recipients`);
      await this.emailService.sendReport({
        to: recipients,
        subject: `Reporte SCILIP - ${filename.replace('.pdf', '').replace(/-/g, ' ')}`,
        body: 'Adjunto encontrará el reporte generado automáticamente por el Sistema SCILIP.',
        attachments: [{ filename, content: pdfBuffer }],
      });
    }
  }
}
