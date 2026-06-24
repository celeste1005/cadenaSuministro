'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogPanel,
  Title,
  Text,
  Button,
  Select,
  SelectItem,
  NumberInput,
  Flex,
} from '@tremor/react';
import { FileDown, X, Loader2 } from 'lucide-react';
import { trpc } from '../../lib/trpc/react';
import { getApiBaseUrl } from '../../lib/auth/config';

interface ReportGeneratorModalProps {
  open: boolean;
  onClose: () => void;
}

type ReportType = 'full-kpi' | 'comparative' | 'transport-vs-sales';
type PeriodType = 'monthly' | 'quarterly' | 'annual';

export function ReportGeneratorModal({ open, onClose }: ReportGeneratorModalProps) {
  const [reportType, setReportType] = useState<ReportType>('full-kpi');
  const [periodType, setPeriodType] = useState<PeriodType>('monthly');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [quarter, setQuarter] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: preview, isFetching: isPreviewLoading } = trpc.report.getReportPreview.useQuery(
    { period: periodType, year, month: periodType === 'monthly' ? month : undefined, quarter: periodType === 'quarterly' ? quarter : undefined },
    { enabled: open && reportType === 'full-kpi', staleTime: 60000 },
  );

  const getEndpoint = () => {
    switch (reportType) {
      case 'full-kpi':
        return `/reports/full-kpi?period=${periodType}&year=${year}${periodType === 'monthly' ? `&month=${month}` : ''}${periodType === 'quarterly' ? `&quarter=${quarter}` : ''}`;
      case 'comparative':
        return `/reports/comparative?year=${year}`;
      case 'transport-vs-sales':
        return `/reports/transport-kpi?year=${year}`;
    }
  };

  const getFilename = () => {
    switch (reportType) {
      case 'full-kpi':
        return `reporte-kpis-${periodType}-${year}.pdf`;
      case 'comparative':
        return `reporte-comparativo-${year - 1}-vs-${year}.pdf`;
      case 'transport-vs-sales':
        return `reporte-transporte-${year}.pdf`;
    }
  };

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}${getEndpoint()}`, { credentials: 'include' });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Error al generar el reporte' }));
        throw new Error(err.message);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = getFilename();
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Generation failed:', err);
      alert(err instanceof Error ? err.message : 'Error al generar el reporte');
    } finally {
      setIsGenerating(false);
      onClose();
    }
  };

  const reportTypes = [
    { value: 'full-kpi' as const, label: 'Reporte Completo de KPIs' },
    { value: 'comparative' as const, label: 'Análisis Comparativo Anual' },
    { value: 'transport-vs-sales' as const, label: 'Costo Transporte vs Ventas' },
  ];

  return (
    <Dialog open={open} onClose={onClose} static={true}>
      <DialogPanel className="max-w-lg">
        <Flex justifyContent="between" alignItems="center">
          <Title>Generar Nuevo Reporte</Title>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </Flex>

        <div className="mt-6 space-y-4">
          <div>
            <Text className="mb-1 font-medium">Tipo de Reporte</Text>
            <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
              {reportTypes.map((rt) => (
                <SelectItem key={rt.value} value={rt.value}>{rt.label}</SelectItem>
              ))}
            </Select>
          </div>

          <Flex className="space-x-4">
            <div className="flex-1">
              <Text className="mb-1 font-medium">Año</Text>
              <NumberInput
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                min={2020}
                max={2030}
                placeholder="Año"
              />
            </div>

            {(reportType === 'full-kpi') && (
              <div className="flex-1">
                <Text className="mb-1 font-medium">Periodo</Text>
                <Select value={periodType} onValueChange={(v) => setPeriodType(v as PeriodType)}>
                  <SelectItem value="monthly">Mensual</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                  <SelectItem value="annual">Anual</SelectItem>
                </Select>
              </div>
            )}
          </Flex>

          {(reportType === 'full-kpi' && periodType === 'monthly') && (
            <div>
              <Text className="mb-1 font-medium">Mes</Text>
              <Select value={String(month)} onValueChange={(v) => setMonth(parseInt(v))}>
                {[
                  { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' },
                  { value: 3, label: 'Marzo' }, { value: 4, label: 'Abril' },
                  { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
                  { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' },
                  { value: 9, label: 'Septiembre' }, { value: 10, label: 'Octubre' },
                  { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' },
                ].map((m) => (
                  <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                ))}
              </Select>
            </div>
          )}

          {(reportType === 'full-kpi' && periodType === 'quarterly') && (
            <div>
              <Text className="mb-1 font-medium">Trimestre</Text>
              <Select value={String(quarter)} onValueChange={(v) => setQuarter(parseInt(v))}>
                <SelectItem value="1">Q1 (Ene-Mar)</SelectItem>
                <SelectItem value="2">Q2 (Abr-Jun)</SelectItem>
                <SelectItem value="3">Q3 (Jul-Sep)</SelectItem>
                <SelectItem value="4">Q4 (Oct-Dic)</SelectItem>
              </Select>
            </div>
          )}

          {preview && reportType === 'full-kpi' && (
            <div className="bg-gray-50 rounded-lg p-4">
              <Text className="font-medium mb-2">Vista Previa</Text>
              <Flex justifyContent="between" className="text-sm">
                <span>Periodo:</span>
                <span className="font-medium">{preview.periodLabel}</span>
              </Flex>
              <Flex justifyContent="between" className="text-sm mt-1">
                <span>Total KPIs:</span>
                <span className="font-medium">{preview.totalKpis}</span>
              </Flex>
              <Flex justifyContent="between" className="text-sm mt-1">
                <span>Cumplimiento:</span>
                <span className={`font-medium ${
                  preview.averageCompliance >= 80 ? 'text-emerald-600' :
                  preview.averageCompliance >= 50 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {preview.averageCompliance}%
                </span>
              </Flex>
              {preview.critical > 0 && (
                <Flex justifyContent="between" className="text-sm mt-1">
                  <span>Críticos:</span>
                  <span className="font-medium text-red-600">{preview.critical}</span>
                </Flex>
              )}
            </div>
          )}
        </div>

        <Flex justifyContent="end" className="mt-6 space-x-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button
            icon={isGenerating ? Loader2 : FileDown}
            disabled={isGenerating || isPreviewLoading}
            onClick={handleGenerate}
          >
            {isGenerating ? 'Generando...' : 'Generar PDF'}
          </Button>
        </Flex>
      </DialogPanel>
    </Dialog>
  );
}
