import { Controller, Get, Query, Res, UseGuards, Request } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('transport-kpi')
  async downloadTransportReport(
    @Query('year') year: string,
    @Request() req: any,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.reportsService.generateTransportKpiReport(
      req.user.companyId,
      parseInt(year) || new Date().getFullYear(),
      req.user.id,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=reporte-transporte-${year}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }
}