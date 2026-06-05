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
  AreaChart,
} from '@tremor/react';
import { 
  Truck, 
  DollarSign, 
  BarChart3, 
  PlusCircle,
  Users,
  Navigation,
  ArrowUpRight,
  ArrowDownRight,
  Route,
  History
} from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import { KPICard } from '@/components/ui/kpi-card';
import { TransportCostModal } from '@/components/transport/transport-cost-modal';

export default function TransportPage() {
  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [selectedYear] = useState(new Date().getFullYear());
  const [selectedPeriod] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1),
    endDate: new Date(),
  });

  const utils = trpc.useUtils();

  // Consultas a tRPC
  const transportVsSales = trpc.transport.getTransportVsSalesSummary.useQuery({ year: selectedYear });
  const costPerDriver = trpc.kpi.getKpiData.useQuery({
    code: 'NOR_DIS_IND_19',
    ...selectedPeriod,
  });

  const { data: vehicles, isLoading: loadingVehicles } = trpc.transport.getVehicles.useQuery();
  const { data: costs, isLoading: loadingCosts } = trpc.transport.getTransportCosts.useQuery();

  const handleCostSuccess = () => {
    utils.transport.getTransportVsSalesSummary.invalidate();
    utils.transport.getTransportCosts.invalidate();
    utils.kpi.getKpiData.invalidate({ code: 'NOR_DIS_IND_19' });
  };

  return (
    <main className="p-4 sm:p-6 lg:p-10">
      <Flex justifyContent="between" alignItems="center" flexDirection="col" className="sm:flex-row space-y-4 sm:space-y-0">
        <div className="text-center sm:text-left">
          <Title className="text-2xl font-bold">Gestión de Transporte</Title>
          <Text className="text-gray-500">Monitoreo de flota, costos de distribución y eficiencia de rutas.</Text>
        </div>
        <Button 
          icon={PlusCircle} 
          size="sm" 
          color="orange"
          className="w-full sm:w-auto"
          onClick={() => setIsCostModalOpen(true)}
        >
          Registrar Gasto de Viaje
        </Button>
      </Flex>

      <TransportCostModal
        isOpen={isCostModalOpen}
        onClose={() => setIsCostModalOpen(false)}
        onSuccess={handleCostSuccess}
      />

      {/* KPIs Responsivos */}
      <Grid numItemsSm={1} numItemsMd={2} numItemsLg={3} className="gap-6 mt-8">
        <KPICard
          title="Transporte vs Ventas"
          value={transportVsSales.data?.averagePercentage ?? 0}
          unit="%"
          status={(transportVsSales.data?.averagePercentage ?? 0) < 10 ? 'good' : 'warning'}
          direction={transportVsSales.data?.trend === 'down' ? 'down' : 'up'}
          subtitle="NOR_DIS_IND_18"
          loading={transportVsSales.isLoading}
        />
        <KPICard
          title="Costo por Conductor"
          value={costPerDriver.data?.costPerDriver ?? 0}
          unit="COP/emp"
          status="neutral"
          subtitle="NOR_DIS_IND_19"
          loading={costPerDriver.isLoading}
        />
        <Card className="p-6">
          <Flex alignItems="start" justifyContent="between">
            <div>
              <Text className="text-gray-600">Vehículos en Ruta</Text>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-gray-900">
                  {vehicles?.filter(v => v.status === 'IN_TRANSIT').length || 0}
                </span>
                <Badge color="orange" icon={Navigation}>En Tránsito</Badge>
              </div>
            </div>
            <Truck className="h-8 w-8 text-orange-500" />
          </Flex>
        </Card>
      </Grid>

      <TabGroup className="mt-10">
        <TabList className="overflow-x-auto">
          <Tab icon={Truck}>Flota</Tab>
          <Tab icon={History}>Costos de Viaje</Tab>
          <Tab icon={BarChart3}>Análisis Mensual</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Grid numItemsMd={1} numItemsLg={2} className="gap-6 mt-6">
              <Card>
                <Title>Estado de Vehículos</Title>
                <div className="mt-4 space-y-4">
                  {loadingVehicles ? (
                    <Text className="text-center py-10 text-gray-400 italic">Cargando flota...</Text>
                  ) : vehicles?.length === 0 ? (
                    <Text className="text-center py-10 text-gray-400 italic">No hay vehículos registrados.</Text>
                  ) : (
                    vehicles?.map((v) => (
                      <div key={v.id} className="p-4 border rounded-lg bg-gray-50">
                        <Flex justifyContent="between">
                          <Flex justifyContent="start" className="space-x-3">
                            <Truck className="h-5 w-5 text-gray-400" />
                            <div>
                              <Text className="font-bold text-gray-900">{v.plate}</Text>
                              <Text className="text-xs text-gray-500">{v.brand} {v.model} ({v.type})</Text>
                            </div>
                          </Flex>
                          <Badge color={v.status === 'AVAILABLE' ? 'emerald' : v.status === 'IN_TRANSIT' ? 'orange' : 'red'}>
                            {v.status === 'AVAILABLE' ? 'Disponible' : v.status === 'IN_TRANSIT' ? 'En Ruta' : 'Mantenimiento'}
                          </Badge>
                        </Flex>
                      </div>
                    ))
                  )}
                </div>
              </Card>
              <Card>
                <Title>Capacidad de Carga Utilizada</Title>
                <div className="h-72 mt-4 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                   <Text className="text-gray-400 italic">Gráfico de utilización de capacidad en desarrollo.</Text>
                </div>
              </Card>
            </Grid>
          </TabPanel>
          
          <TabPanel>
            <Card className="mt-6 p-0 sm:p-6 overflow-hidden">
              <div className="p-4 sm:p-0">
                <Title>Historial de Costos de Transporte</Title>
                <Text className="mb-4">Registro detallado de gastos por vehículo y ruta.</Text>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-gray-50 text-gray-500 uppercase text-xs font-medium">
                    <tr>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Vehículo</th>
                      <th className="px-4 py-3">Tipo</th>
                      <th className="px-4 py-3">Ruta</th>
                      <th className="px-4 py-3 text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {loadingCosts ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-gray-400 italic">
                          Cargando costos...
                        </td>
                      </tr>
                    ) : costs?.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-gray-400 italic">
                          No hay costos registrados.
                        </td>
                      </tr>
                    ) : (
                      costs?.map((cost) => (
                        <tr key={cost.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            {new Date(cost.costDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {cost.vehicle?.plate || 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            <Badge color="orange" variant="light">{cost.costType}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Flex justifyContent="start" className="space-x-1">
                              <Route className="h-3 w-3 text-gray-400" />
                              <Text className="text-xs">{cost.route || '-'}</Text>
                            </Flex>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-gray-900">
                            ${Number(cost.amount).toLocaleString()}
                          </td>
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
              <Title>Tendencia de Costo de Transporte vs Ventas</Title>
              <Text>Variación mensual del indicador NOR_DIS_IND_18.</Text>
              <AreaChart
                className="h-72 mt-8"
                data={trpc.transport.getTransportVsSalesMonthly.useQuery({ year: selectedYear }).data || []}
                index="month"
                categories={["percentage"]}
                colors={["orange"]}
                valueFormatter={(number) => `${number.toFixed(2)}%`}
                yAxisWidth={40}
              />
            </Card>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </main>
  );
}
