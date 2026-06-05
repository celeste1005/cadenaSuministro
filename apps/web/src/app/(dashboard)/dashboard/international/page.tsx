"use client";

import React, { useState } from 'react';
import { 
  Title, 
  Text, 
  Card, 
  Grid, 
  TabGroup, 
  TabList, 
  Tab, 
  TabPanels, 
  TabPanel,
  Button,
  Flex,
  Badge,
  BarChart,
} from '@tremor/react';
import { 
  Globe, 
  Ship, 
  Plane, 
  PlusCircle,
  FileCheck,
  TrendingUp,
  DollarSign,
  Anchor,
  Navigation,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  History
} from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import { KPICard } from '@/components/ui/kpi-card';
import { ImportExportModal } from '@/components/international/import-export-modal';

export default function InternationalPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPeriod] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1),
    endDate: new Date(),
  });

  const utils = trpc.useUtils();

  // Consultas a tRPC
  const importUnitCost = trpc.internationalTrade.getUnitCost.useQuery({
    ...selectedPeriod,
    type: 'IMPORT',
  });

  const exportUnitCost = trpc.internationalTrade.getUnitCost.useQuery({
    ...selectedPeriod,
    type: 'EXPORT',
  });

  const { data: operations, isLoading: loadingOperations } = trpc.internationalTrade.getOperations.useQuery();

  const handleSuccess = () => {
    utils.internationalTrade.getOperations.invalidate();
    utils.internationalTrade.getUnitCost.invalidate();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED': return <Badge color="emerald">Entregado</Badge>;
      case 'IN_TRANSIT': return <Badge color="cyan">En Tránsito</Badge>;
      case 'CUSTOMS': return <Badge color="amber">En Aduana</Badge>;
      case 'PORT_OF_ORIGIN': return <Badge color="gray">En Puerto Origen</Badge>;
      default: return <Badge color="blue">{status}</Badge>;
    }
  };

  return (
    <main className="p-4 sm:p-6 lg:p-10">
      <Flex justifyContent="between" alignItems="center" flexDirection="col" className="sm:flex-row space-y-4 sm:space-y-0">
        <div className="text-center sm:text-left">
          <Title className="text-2xl font-bold">Comercio Exterior</Title>
          <Text className="text-gray-500">Gestión de importaciones, exportaciones y costos DDP/EXW.</Text>
        </div>
        <Button 
          icon={PlusCircle} 
          size="sm" 
          color="cyan"
          className="w-full sm:w-auto"
          onClick={() => setIsModalOpen(true)}
        >
          Registrar Operación
        </Button>
      </Flex>

      <ImportExportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />

      {/* KPIs Responsivos */}
      <Grid numItemsSm={1} numItemsMd={2} numItemsLg={3} className="gap-6 mt-8">
        <KPICard
          title="Costo Unitario Importación"
          value={importUnitCost.data?.unitCostUsd ?? 0}
          unit="USD/und"
          status="neutral"
          subtitle="NOR_DIS_IND_28 (IMPORT)"
          loading={importUnitCost.isLoading}
        />
        <KPICard
          title="Costo Unitario Exportación"
          value={exportUnitCost.data?.unitCostUsd ?? 0}
          unit="USD/und"
          status="neutral"
          subtitle="NOR_DIS_IND_28 (EXPORT)"
          loading={exportUnitCost.isLoading}
        />
        <Card className="p-6">
          <Flex alignItems="start" justifyContent="between">
            <div>
              <Text className="text-gray-600">Operaciones Activas</Text>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-gray-900">
                  {operations?.filter(o => o.status !== 'DELIVERED').length || 0}
                </span>
                <Badge color="cyan" icon={Globe}>En Curso</Badge>
              </div>
            </div>
            <Ship className="h-8 w-8 text-cyan-500" />
          </Flex>
        </Card>
      </Grid>

      <TabGroup className="mt-10">
        <TabList className="overflow-x-auto">
          <Tab icon={Ship}>Importaciones</Tab>
          <Tab icon={Plane}>Exportaciones</Tab>
          <Tab icon={History}>Historial Completo</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Card className="mt-6 p-0 sm:p-6 overflow-hidden">
              <div className="p-4 sm:p-0">
                <Title>Seguimiento de Importaciones</Title>
                <Text className="mb-4">Operaciones de compra internacional en curso.</Text>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-gray-50 text-gray-500 uppercase text-xs font-medium">
                    <tr>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Producto</th>
                      <th className="px-4 py-3">Proveedor</th>
                      <th className="px-4 py-3">Puerto Origen</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3 text-right">Costo DDP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {loadingOperations ? (
                      <tr><td colSpan={6} className="px-4 py-10 text-center italic text-gray-400">Cargando importaciones...</td></tr>
                    ) : operations?.filter(o => o.operationType === 'IMPORT').length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-10 text-center italic text-gray-400">No hay importaciones registradas.</td></tr>
                    ) : (
                      operations?.filter(o => o.operationType === 'IMPORT').map((op) => (
                        <tr key={op.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">{new Date(op.operationDate).toLocaleDateString()}</td>
                          <td className="px-4 py-3 font-medium text-gray-900">{op.product?.name}</td>
                          <td className="px-4 py-3">{op.supplier?.name}</td>
                          <td className="px-4 py-3">
                            <Flex justifyContent="start" className="space-x-1">
                              <Anchor className="h-3 w-3 text-gray-400" />
                              <Text className="text-xs">{op.portOfOrigin || '-'}</Text>
                            </Flex>
                          </td>
                          <td className="px-4 py-3">{getStatusBadge(op.status)}</td>
                          <td className="px-4 py-3 text-right font-bold text-gray-900">${Number(op.totalCostUsd).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabPanel>
          
          <TabPanel>
            <Card className="mt-6 p-0 sm:p-6 overflow-hidden">
              <div className="p-4 sm:p-0">
                <Title>Seguimiento de Exportaciones</Title>
                <Text className="mb-4">Despachos internacionales a clientes en el exterior.</Text>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-gray-50 text-gray-500 uppercase text-xs font-medium">
                    <tr>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Producto</th>
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3">Puerto Destino</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3 text-right">Valor EXW</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {loadingOperations ? (
                      <tr><td colSpan={6} className="px-4 py-10 text-center italic text-gray-400">Cargando exportaciones...</td></tr>
                    ) : operations?.filter(o => o.operationType === 'EXPORT').length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-10 text-center italic text-gray-400">No hay exportaciones registradas.</td></tr>
                    ) : (
                      operations?.filter(o => o.operationType === 'EXPORT').map((op) => (
                        <tr key={op.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">{new Date(op.operationDate).toLocaleDateString()}</td>
                          <td className="px-4 py-3 font-medium text-gray-900">{op.product?.name}</td>
                          <td className="px-4 py-3">{op.customerName}</td>
                          <td className="px-4 py-3">
                            <Flex justifyContent="start" className="space-x-1">
                              <Navigation className="h-3 w-3 text-gray-400" />
                              <Text className="text-xs">{op.portOfDestination || '-'}</Text>
                            </Flex>
                          </td>
                          <td className="px-4 py-3">{getStatusBadge(op.status)}</td>
                          <td className="px-4 py-3 text-right font-bold text-gray-900">${Number(op.totalCostUsd).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabPanel>

          <TabPanel>
            <Card className="mt-6">
              <Title>Consolidado Histórico</Title>
              <div className="h-72 mt-4 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                 <Text className="text-gray-400 italic text-center">Gráfico de barras comparativo entre volumen de Importación vs Exportación en desarrollo.</Text>
              </div>
            </Card>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </main>
  );
}
