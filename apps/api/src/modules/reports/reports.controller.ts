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
    const companyId = req.user.role?.permissions?.companyId;
    if (!companyId) {
      return this.respondWithError(res, 'Usuario no tiene compañía asignada');
    }

    const pdfBuffer = await this.reportsService.generateTransportKpiReport(
      companyId,
      parseInt(year) || new Date().getFullYear(),
      req.user.id,
    );

    this.respondWithPdf(res, pdfBuffer, `reporte-transporte-${year}.pdf`);
  }

  @UseGuards(JwtAuthGuard)
  @Get('full-kpi')
  async downloadFullKpiReport(
    @Query('period') period: string,
    @Query('year') year: string,
    @Query('month') month: string,
    @Query('quarter') quarter: string,
    @Request() req: any,
    @Res() res: Response,
  ) {
    const companyId = req.user.role?.permissions?.companyId;
    if (!companyId) {
      return this.respondWithError(res, 'Usuario no tiene compañía asignada');
    }

    const periodType = period === 'monthly' ? 'monthly' : period === 'quarterly' ? 'quarterly' : 'annual';
    const reportYear = parseInt(year) || new Date().getFullYear();
    const reportMonth = month ? parseInt(month) : undefined;
    const reportQuarter = quarter ? parseInt(quarter) : undefined;

    const pdfBuffer = await this.reportsService.generateFullKpiReport(
      companyId,
      periodType,
      reportYear,
      req.user.id,
      reportMonth,
      reportQuarter,
    );

    const filename = `reporte-kpis-${periodType}-${reportYear}${reportMonth ? `-${reportMonth}` : ''}${reportQuarter ? `-q${reportQuarter}` : ''}.pdf`;
    this.respondWithPdf(res, pdfBuffer, filename);
  }

  @UseGuards(JwtAuthGuard)
  @Get('comparative')
  async downloadComparativeReport(
    @Query('year') year: string,
    @Request() req: any,
    @Res() res: Response,
  ) {
    const companyId = req.user.role?.permissions?.companyId;
    if (!companyId) {
      return this.respondWithError(res, 'Usuario no tiene compañía asignada');
    }

    const reportYear = parseInt(year) || new Date().getFullYear();

    const pdfBuffer = await this.reportsService.generateComparativeReport(
      companyId,
      reportYear,
      req.user.id,
    );

    const filename = `reporte-comparativo-${reportYear - 1}-vs-${reportYear}.pdf`;
    this.respondWithPdf(res, pdfBuffer, filename);
  }

  private respondWithPdf(res: Response, buffer: Buffer, filename: string) {
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${filename}`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  private respondWithError(res: Response, message: string) {
    res.status(400).json({ message });
  }
}
