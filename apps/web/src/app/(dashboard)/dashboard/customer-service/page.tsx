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
  DonutChart,
  List,
  ListItem,
} from '@tremor/react';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  FileText,
  Truck,
  PlusCircle,
  ThumbsUp,
  Package,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import { KPICard } from '@/components/ui/kpi-card';
import { DispatchModal } from '@/components/customer-service/dispatch-modal';

export default function CustomerServicePage() {
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [selectedPeriod] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1),
    endDate: new Date(),
  });

  const utils = trpc.useUtils();

  // Consultas a tRPC
  const perfectDeliveries = trpc.kpi.getKpiData.useQuery({
    code: 'NOR_DIS_IND_24',
    ...selectedPeriod,
  });

  const onTimeDeliveries = trpc.kpi.getKpiData.useQuery({
    code: 'NOR_DIS_IND_21',
    ...selectedPeriod,
  });

  const completeDeliveries = trpc.kpi.getKpiData.useQuery({
    code: 'NOR_DIS_IND_22',
    ...selectedPeriod,
  });

  const { data: dispatches, isLoading: loadingDispatches } = trpc.customerService.getDispatches.useQuery();

  const handleDispatchSuccess = () => {
    utils.customerService.getDispatches.invalidate();
    utils.kpi.getKpiData.invalidate();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED': return <Badge color="emerald">Entregado</Badge>;
      case 'IN_TRANSIT': return <Badge color="orange">En Camino</Badge>;
      case 'PENDING': return <Badge color="gray">Pendiente</Badge>;
      case 'CANCELLED': return <Badge color="red">Cancelado</Badge>;
      default: return <Badge color="blue">{status}</Badge>;
    }
  };

  return (
    <main className="p-4 sm:p-6 lg:p-10">
      <Flex justifyContent="between" alignItems="center" flexDirection="col" className="sm:flex-row space-y-4 sm:space-y-0">
        <div className="text-center sm:text-left">
          <Title className="text-2xl font-bold">Servicio al Cliente</Title>
          <Text className="text-gray-500">Satisfacción del cliente y calidad en las entregas finales.</Text>
        </div>
        <Button 
          icon={PlusCircle} 
          size="sm" 
          className="w-full sm:w-auto"
          onClick={() => setIsDispatchModalOpen(true)}
        >
          Nuevo Despacho
        </Button>
      </Flex>

      <DispatchModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        onSuccess={handleDispatchSuccess}
      />

      {/* KPIs Responsivos */}
      <Grid numItemsSm={1} numItemsMd={2} numItemsLg={3} className="gap-6 mt-8">
        <KPICard
          title="Entregas Perfectas"
          value={perfectDeliveries.data?.perfectDeliveriesPercentage ?? 0}
          unit="%"
          status={(perfectDeliveries.data?.perfectDeliveriesPercentage ?? 0) > 90 ? 'good' : 'bad'}
          direction="up"
          subtitle="NOR_DIS_IND_24"
          loading={perfectDeliveries.isLoading}
        />
        <KPICard
          title="Entregas a Tiempo"
          value={onTimeDeliveries.data?.onTimePercentage ?? 0}
          unit="%"
          status={(onTimeDeliveries.data?.onTimePercentage ?? 0) > 95 ? 'good' : 'warning'}
          direction="up"
          subtitle="NOR_DIS_IND_21"
          loading={onTimeDeliveries.isLoading}
        />
        <KPICard
          title="Entregas Completas"
          value={completeDeliveries.data?.completePercentage ?? 0}
          unit="%"
          status={(completeDeliveries.data?.completePercentage ?? 0) > 95 ? 'good' : 'warning'}
          direction="up"
          subtitle="NOR_DIS_IND_22"
          loading={completeDeliveries.isLoading}
        />
      </Grid>

      <TabGroup className="mt-10">
        <TabList className="overflow-x-auto">
          <Tab icon={Truck}>Despachos</Tab>
          <Tab icon={ThumbsUp}>Satisfacción</Tab>
          <Tab icon={FileText}>Documentación</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Grid numItemsMd={1} numItemsLg={2} className="gap-6 mt-6">
              <Card>
                <Title>Composición de la Entrega</Title>
                <DonutChart
                  className="h-72 mt-4"
                  data={[
                    { name: 'A Tiempo', value: onTimeDeliveries.data?.onTimeOrders ?? 0 },
                    { name: 'Retrasadas', value: (onTimeDeliveries.data?.totalOrders ?? 0) - (onTimeDeliveries.data?.onTimeOrders ?? 0) },
                  ]}
                  category="value"
                  index="name"
                  colors={["emerald", "red"]}
                />
              </Card>
              <Card className="overflow-hidden p-0 sm:p-6">
                <div className="p-4 sm:p-0">
                  <Title>Últimos Despachos</Title>
                  <Text className="text-xs text-gray-500 mb-4">Seguimiento de órdenes de salida.</Text>
                </div>
                <List className="mt-2">
                   {loadingDispatches ? (
                     <ListItem>Cargando despachos...</ListItem>
                   ) : dispatches?.length === 0 ? (
                     <ListItem>No hay despachos registrados.</ListItem>
                   ) : (
                     dispatches?.slice(0, 5).map((dispatch) => (
                       <ListItem key={dispatch.id} className="hover:bg-gray-50 p-3 rounded-lg transition-colors">
                          <Flex justifyContent="start" className="space-x-4">
                            <div className="bg-blue-50 p-2 rounded-lg">
                              <Package className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="truncate">
                              <Text className="font-bold text-gray-900 truncate">
                                {dispatch.customer?.name}
                              </Text>
                              <Flex justifyContent="start" className="space-x-2">
                                <Text className="text-xs text-gray-400">Ref: {dispatch.orderReference}</Text>
                                <Text className="text-xs text-gray-300">|</Text>
                                <Flex justifyContent="start" className="space-x-1">
                                  <Calendar className="h-3 w-3 text-gray-300" />
                                  <Text className="text-xs text-gray-400">
                                    {new Date(dispatch.dispatchDate).toLocaleDateString()}
                                  </Text>
                                </Flex>
                              </Flex>
                            </div>
                          </Flex>
                          {getStatusBadge(dispatch.dispatchStatus)}
                       </ListItem>
                     ))
                   )}
                </List>
                {dispatches && dispatches.length > 5 && (
                  <Button variant="light" size="xs" className="mt-4 w-full">Ver todos los despachos</Button>
                )}
              </Card>
            </Grid>
          </TabPanel>
          
          <TabPanel>
            <Card className="mt-6 h-72 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
               <Text className="text-gray-400">Encuestas de satisfacción y NPS en desarrollo.</Text>
            </Card>
          </TabPanel>

          <TabPanel>
            <Card className="mt-6">
              <Title>Calidad de la Documentación (NOR_DIS_IND_23)</Title>
              <Text className="mb-6 text-gray-500">Porcentaje de documentos de despacho sin errores sobre el total emitido.</Text>
              
              <Grid numItemsSm={1} numItemsMd={2} className="gap-10 items-center">
                <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="relative h-40 w-40">
                    <svg className="h-full w-full" viewBox="0 0 100 100">
                      <circle
                        className="text-gray-200 stroke-current"
                        strokeWidth="8"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                      <circle
                        className="text-blue-500 stroke-current"
                        strokeWidth="8"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * 98.2) / 100}
                        strokeLinecap="round"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-gray-900">98.2%</span>
                      <Text className="text-[10px] uppercase font-bold text-blue-500 tracking-wider">Exactitud</Text>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-white border rounded-xl shadow-sm">
                    <Flex justifyContent="start" className="space-x-3">
                      <div className="p-2 bg-emerald-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <Text className="font-bold">1,245 Facturas OK</Text>
                        <Text className="text-xs text-gray-400">Sin reclamaciones en el periodo</Text>
                      </div>
                    </Flex>
                  </div>
                  <div className="p-4 bg-white border rounded-xl shadow-sm">
                    <Flex justifyContent="start" className="space-x-3">
                      <div className="p-2 bg-red-50 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <Text className="font-bold">23 Errores Detectados</Text>
                        <Text className="text-xs text-gray-400">Principalmente errores de precio o cantidad</Text>
                      </div>
                    </Flex>
                  </div>
                </div>
              </Grid>
            </Card>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </main>
  );
}
