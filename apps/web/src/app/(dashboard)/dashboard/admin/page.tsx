'use client';

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
  ProgressBar,
} from '@tremor/react';
import { 
  Factory, 
  Settings, 
  Activity, 
  PlusCircle,
  AlertCircle,
  Zap
} from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import { KPICard } from '@/components/ui/kpi-card';

export default function AdminPage() {
  const [selectedPeriod] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1),
    endDate: new Date(),
  });
  const [selectedMachineId, setSelectedMachineId] = useState<string>('');

  // TODO: Add getMachines endpoint to inventory router to fetch real machines
  // For now, using placeholder - this needs to be connected to real data
  const machines = [
    { id: '1', name: 'Máquina A' },
    { id: '2', name: 'Máquina B' },
    { id: '3', name: 'Máquina C' },
  ];

  // Consultas a tRPC
  const capacityUtilization = trpc.kpi.getKpiData.useQuery({
    code: 'NOR_DIS_IND_05',
    ...selectedPeriod,
    machineId: selectedMachineId || machines[0]?.id,
  }, {
    enabled: !!selectedMachineId || !!machines[0]?.id,
  });

  const machinePerformance = trpc.kpi.getKpiData.useQuery({
    code: 'NOR_DIS_IND_06',
    ...selectedPeriod,
    machineId: selectedMachineId || machines[0]?.id,
  }, {
    enabled: !!selectedMachineId || !!machines[0]?.id,
  });

  return (
    <main className="p-4 sm:p-6 lg:p-10">
      <Flex justifyContent="between" alignItems="center" flexDirection="col" className="sm:flex-row space-y-4 sm:space-y-0">
        <div className="text-center sm:text-left">
          <Title className="text-2xl font-bold">Producción e Ingeniería</Title>
          <Text className="text-gray-500">Monitoreo de eficiencia de planta y rendimiento de maquinaria.</Text>
        </div>
        <Button icon={PlusCircle} size="sm" className="w-full sm:w-auto" disabled>
          Registrar Producción
        </Button>
      </Flex>

      {/* KPIs Responsivos */}
      <Grid numItemsSm={1} numItemsMd={2} numItemsLg={3} className="gap-6 mt-8">
        <KPICard
          title="Utilización de Capacidad"
          value={capacityUtilization.data?.utilizationPercentage ?? 0}
          unit="%"
          status={(capacityUtilization.data?.utilizationPercentage ?? 0) > 80 ? 'good' : 'warning'}
          direction="up"
          subtitle="NOR_DIS_IND_05"
          loading={capacityUtilization.isLoading}
        />
        <KPICard
          title="Rendimiento de Máquinas"
          value={machinePerformance.data?.performancePercentage ?? 0}
          unit="%"
          status={(machinePerformance.data?.performancePercentage ?? 0) > 90 ? 'good' : 'warning'}
          direction="up"
          subtitle="NOR_DIS_IND_06"
          loading={machinePerformance.isLoading}
        />
        <Card className="p-6">
          <Flex alignItems="start" justifyContent="between">
            <div>
              <Text className="text-gray-600">Eficiencia Energética</Text>
              <div className="mt-2">
                <span className="text-2xl font-bold text-gray-900">92%</span>
                <ProgressBar value={92} color="emerald" className="mt-2" />
              </div>
            </div>
            <Zap className="h-8 w-8 text-yellow-500" />
          </Flex>
        </Card>
      </Grid>

      <TabGroup className="mt-10">
        <TabList className="overflow-x-auto">
          <Tab icon={Activity}>Líneas de Producción</Tab>
          <Tab icon={Settings}>Mantenimiento</Tab>
          <Tab icon={AlertCircle}>Alertas</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Card className="mt-6">
              <Title>Estado de Líneas en Tiempo Real</Title>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                 {[1, 2, 3].map((line) => (
                   <div key={line} className="p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                      <Flex justifyContent="between">
                         <Text className="font-bold">Línea de Ensamble {line}</Text>
                         <Badge color={line === 3 ? "red" : "emerald"}>
                            {line === 3 ? "Detenida" : "En Marcha"}
                         </Badge>
                      </Flex>
                      <Text className="text-xs text-gray-400 mt-1">Última actualización: hace 5 min</Text>
                      <div className="mt-4">
                         <Text className="text-xs mb-1">Carga de trabajo</Text>
                         <ProgressBar value={line === 1 ? 85 : line === 2 ? 40 : 0} color={line === 1 ? "blue" : "amber"} />
                      </div>
                   </div>
                 ))}
              </div>
            </Card>
          </TabPanel>
          
          <TabPanel>
            <Card className="mt-6 h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
               <Text className="text-gray-400">Calendario de mantenimiento preventivo en desarrollo.</Text>
            </Card>
          </TabPanel>

          <TabPanel>
            <Card className="mt-6">
              <Title>Alertas Críticas de Operación</Title>
              <div className="mt-4 space-y-2">
                 <Badge color="red" className="w-full justify-start p-3 text-sm">
                    ⚠️ Línea 3: Parada no programada detectada (Sensor de calor)
                 </Badge>
                 <Badge color="amber" className="w-full justify-start p-3 text-sm">
                    ⚡ Línea 2: Variación de voltaje detectada en motor principal
                 </Badge>
              </div>
            </Card>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </main>
  );
}
