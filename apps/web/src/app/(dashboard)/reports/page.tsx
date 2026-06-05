'use client';

import React from 'react';
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
  Badge
} from '@tremor/react';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  FileDown,
  Printer
} from 'lucide-react';

export default function ReportsPage() {
  const reports = [
    { id: 1, name: 'Reporte Mensual de KPIs - Mayo 2024', date: '2024-05-31', type: 'PDF', status: 'Listo' },
    { id: 2, name: 'Análisis de Costos de Transporte Q1', date: '2024-04-15', type: 'Excel', status: 'Listo' },
    { id: 3, name: 'Auditoría de Inventarios CEDI Norte', date: '2024-03-20', type: 'PDF', status: 'Archivado' },
  ];

  return (
    <main className="p-4 sm:p-6 lg:p-10">
      <Flex justifyContent="between" alignItems="center" flexDirection="col" className="sm:flex-row space-y-4 sm:space-y-0">
        <div className="text-center sm:text-left">
          <Title className="text-2xl font-bold">Reportes Logísticos</Title>
          <Text className="text-gray-500">Generación y descarga de informes técnicos de gestión.</Text>
        </div>
        <div className="flex space-x-2 w-full sm:w-auto">
          <Button icon={Filter} variant="secondary" size="sm" className="flex-1 sm:flex-none">Filtrar</Button>
          <Button icon={FileDown} size="sm" className="flex-1 sm:flex-none">Nuevo Reporte</Button>
        </div>
      </Flex>

      <Grid numItemsSm={1} numItemsMd={2} className="gap-6 mt-8">
        <Card decoration="top" decorationColor="blue">
          <Flex alignItems="start">
            <div className="flex-1">
              <Text className="font-medium">Último Reporte Generado</Text>
              <Title className="mt-1">Indicadores de Gestión Mayo</Title>
              <Text className="text-sm text-gray-400 mt-1">Generado hace 2 horas por Admin</Text>
            </div>
            <Badge icon={FileText} color="blue">PDF</Badge>
          </Flex>
          <div className="mt-6 flex space-x-2">
            <Button size="xs" variant="primary" icon={Download} className="flex-1">Descargar</Button>
            <Button size="xs" variant="secondary" icon={Printer} className="flex-1">Imprimir</Button>
          </div>
        </Card>
        
        <Card decoration="top" decorationColor="emerald">
          <Flex alignItems="start">
             <div className="flex-1">
              <Text className="font-medium">Programación Automática</Text>
              <Title className="mt-1">Reporte Semanal de Rutas</Title>
              <Text className="text-sm text-gray-400 mt-1">Próxima ejecución: Lunes 08:00 AM</Text>
            </div>
            <Calendar className="h-6 w-6 text-emerald-500" />
          </Flex>
          <div className="mt-6">
            <Button size="xs" variant="secondary" className="w-full">Gestionar Programación</Button>
          </div>
        </Card>
      </Grid>

      <Card className="mt-8 p-0 sm:p-6 overflow-hidden">
        <div className="p-4 sm:p-0">
          <Title>Historial de Informes</Title>
          <Text>Consulta y descarga reportes generados anteriormente.</Text>
        </div>
        <div className="overflow-x-auto mt-4">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Nombre del Informe</TableHeaderCell>
                <TableHeaderCell>Fecha</TableHeaderCell>
                <TableHeaderCell>Formato</TableHeaderCell>
                <TableHeaderCell>Estado</TableHeaderCell>
                <TableHeaderCell className="text-right">Acción</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.name}</TableCell>
                  <TableCell>{report.date}</TableCell>
                  <TableCell>{report.type}</TableCell>
                  <TableCell>
                    <Badge color={report.status === 'Listo' ? 'emerald' : 'gray'}>
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="xs" variant="light" icon={Download}>
                      Descargar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </main>
  );
}
