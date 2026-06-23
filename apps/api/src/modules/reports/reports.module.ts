import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { PdfGeneratorService } from './pdf/pdf-generator.service';
import { TransportModule } from '../transport/transport.module';

@Module({
  imports: [TransportModule],
  controllers: [ReportsController],
  providers: [ReportsService, PdfGeneratorService],
  exports: [ReportsService],
})
export class ReportsModule {}
