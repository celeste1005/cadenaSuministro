'use client';

import React, { useState } from 'react';
import {
  Title,
  Text,
  Card,
  Grid,
  Button,
  Flex,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Badge,
} from '@tremor/react';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  FileDown,
  Printer,
  PieChart,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { trpc } from '../../../lib/trpc/react';
import { ExportButton } from '../../../components/reports/export-button';
import { ReportGeneratorModal } from '../../../components/reports/report-generator-modal';

export default function ReportsPage() {
  const [modalOpen, setModalOpen] = useState(false);

  const { data: categories } = trpc.report.getCategories.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  return (
    <main className="p-4 sm:p-6 lg:p-10">
      <Flex justifyContent="between" alignItems="center" flexDirection="col" className="sm:flex-row space-y-4 sm:space-y-0">
        <div className="text-center sm:text-left">
          <Title className="text-2xl font-bold">Reportes Logísticos</Title>
          <Text className="text-gray-500">Generación y descarga de informes técnicos de gestión.</Text>
        </div>
        <div className="flex space-x-2 w-full sm:w-auto">
          <Button icon={Filter} variant="secondary" size="sm" className="flex-1 sm:flex-none">Filtrar</Button>
          <Button icon={FileDown} size="sm" className="flex-1 sm:flex-none" onClick={() => setModalOpen(true)}>
            Nuevo Reporte
          </Button>
        </div>
      </Flex>

      <Grid numItemsSm={1} numItemsMd={2} numItemsLg={3} className="gap-6 mt-8">
        <Card decoration="top" decorationColor="blue">
          <Flex alignItems="start" justifyContent="between">
            <div>
              <Text className="font-medium">Reporte Completo de KPIs</Text>
              <Text className="text-sm text-gray-400 mt-1">28 indicadores logísticos agrupados por categoría</Text>
            </div>
            <BarChart3 className="h-6 w-6 text-blue-500 shrink-0" />
          </Flex>
          <Flex className="mt-4 space-x-2">
            <ExportButton
              endpoint={`/reports/full-kpi?period=monthly&year=${currentYear}&month=${currentMonth}`}
              filename={`reporte-kpis-mensual-${currentYear}.pdf`}
              label="Mensual"
              variant="primary"
              className="flex-1"
            />
            <ExportButton
              endpoint={`/reports/comparative?year=${currentYear}`}
              filename={`reporte-comparativo-${currentYear - 1}-vs-${currentYear}.pdf`}
              label="Comparativo"
              variant="secondary"
              className="flex-1"
            />
          </Flex>
        </Card>

        <Card decoration="top" decorationColor="emerald">
          <Flex alignItems="start" justifyContent="between">
            <div>
              <Text className="font-medium">Costo Transporte vs Ventas</Text>
              <Text className="text-sm text-gray-400 mt-1">Análisis mensual de eficiencia en transporte</Text>
            </div>
            <TrendingUp className="h-6 w-6 text-emerald-500 shrink-0" />
          </Flex>
          <div className="mt-4">
            <ExportButton
              endpoint={`/reports/transport-kpi?year=${currentYear}`}
              filename={`reporte-transporte-${currentYear}.pdf`}
              label="Descargar Reporte"
              variant="primary"
              className="w-full"
            />
          </div>
        </Card>

        <Card decoration="top" decorationColor="violet">
          <Flex alignItems="start" justifyContent="between">
            <div>
              <Text className="font-medium">Cobertura de Indicadores</Text>
              <Text className="text-sm text-gray-400 mt-1">
                {categories ? `${categories.length} categorías disponibles` : 'Cargando...'}
              </Text>
            </div>
            <PieChart className="h-6 w-6 text-violet-500 shrink-0" />
          </Flex>
          <div className="mt-4 space-y-1.5">
            {categories?.slice(0, 4).map((cat) => (
              <Flex key={cat.code} justifyContent="between" className="text-sm">
                <Flex alignItems="center" className="space-x-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span>{cat.name}</span>
                </Flex>
                <span className="font-medium text-gray-600">{cat.count} KPIs</span>
              </Flex>
            ))}
            {categories && categories.length > 4 && (
              <Text className="text-xs text-gray-400 text-center mt-2">
                +{categories.length - 4} categorías más
              </Text>
            )}
          </div>
        </Card>
      </Grid>

      <Card className="mt-8 p-0 sm:p-6 overflow-hidden">
        <div className="p-4 sm:p-0">
          <Title>Reportes Rápidos</Title>
          <Text>Acceso directo a los reportes más utilizados del sistema.</Text>
        </div>
        <div className="overflow-x-auto mt-4">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Reporte</TableHeaderCell>
                <TableHeaderCell>Tipo</TableHeaderCell>
                <TableHeaderCell>Categorías</TableHeaderCell>
                <TableHeaderCell className="text-right">Acción</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Reporte Mensual de KPIs</TableCell>
                <TableCell><Badge color="blue">PDF</Badge></TableCell>
                <TableCell>Todas las categorías</TableCell>
                <TableCell className="text-right">
                  <ExportButton
                    endpoint={`/reports/full-kpi?period=monthly&year=${currentYear}&month=${currentMonth}`}
                    filename={`reporte-kpis-${currentYear}-${currentMonth}.pdf`}
                    label="Mensual"
                    variant="light"
                  />
                  <ExportButton
                    endpoint={`/reports/full-kpi?period=annual&year=${currentYear}`}
                    filename={`reporte-kpis-anual-${currentYear}.pdf`}
                    label="Anual"
                    variant="light"
                    className="ml-2"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Análisis Comparativo Anual</TableCell>
                <TableCell><Badge color="violet">PDF</Badge></TableCell>
                <TableCell>Todas las categorías</TableCell>
                <TableCell className="text-right">
                  <ExportButton
                    endpoint={`/reports/comparative?year=${currentYear}`}
                    filename={`reporte-comparativo-${currentYear - 1}-vs-${currentYear}.pdf`}
                    label={`${currentYear - 1} vs ${currentYear}`}
                    variant="light"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Costo Transporte vs Ventas</TableCell>
                <TableCell><Badge color="emerald">PDF</Badge></TableCell>
                <TableCell>Transporte y Distribución</TableCell>
                <TableCell className="text-right">
                  <ExportButton
                    endpoint={`/reports/transport-kpi?year=${currentYear}`}
                    filename={`reporte-transporte-${currentYear}.pdf`}
                    label="Descargar"
                    variant="light"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Card>

      <ReportGeneratorModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </main>
  );
}
