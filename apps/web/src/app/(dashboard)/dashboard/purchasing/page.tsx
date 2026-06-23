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
  Flex
} from '@tremor/react';
import { 
  PlusCircle, 
  Users, 
  FileText, 
  BarChart3,
  ShoppingCart
} from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import { KPICard } from '@/components/ui/kpi-card';
import { PendingApprovalsTable } from '@/components/dashboard/pending-approvals-table';
import { PurchaseOrderModal } from '@/components/purchasing/purchase-order-modal';

export default function PurchasingPage() {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedPeriod] = React.useState({
    startDate: new Date(new Date().getFullYear(), 0, 1),
    endDate: new Date(),
  });

  const utils = trpc.useUtils();

  // Consultas a tRPC
  const { data: suppliers } = trpc.purchasing.getSuppliers.useQuery();
  const perfectReceipts = trpc.kpi.getKpiData.useQuery({
    code: 'NOR_DIS_IND_03',
    ...selectedPeriod,
  });

  const handleOrderSuccess = () => {
    utils.purchasing.getPurchaseOrders.invalidate();
  };

  return (
    <main className="p-4 sm:p-6 lg:p-10">
      <Flex justifyContent="between" alignItems="center" flexDirection="col" className="sm:flex-row space-y-4 sm:space-y-0">
        <div className="text-center sm:text-left">
          <Title className="text-2xl font-bold">Gestión de Compras</Title>
          <Text className="text-gray-500">Control de suministros, proveedores e indicadores de abastecimiento.</Text>
        </div>
        <Button 
          icon={PlusCircle} 
          size="sm"
          className="w-full sm:w-auto"
          onClick={() => setIsOrderModalOpen(true)}
        >
          Nueva Orden de Compra
        </Button>
      </Flex>

      <PurchaseOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSuccess={handleOrderSuccess}
      />

      <Grid numItemsMd={2} numItemsLg={4} className="gap-6 mt-6">
        <KPICard
          title="Entregas Perfectas Recibidas"
          value={perfectReceipts.data?.rejectedPercentage ?? 0}
          unit="%"
          status={(perfectReceipts.data?.rejectedPercentage ?? 0) < 5 ? 'good' : 'warning'}
          direction="down"
          subtitle="NOR_DIS_IND_03"
          loading={perfectReceipts.isLoading}
        />
        <KPICard
          title="Proveedores Activos"
          value={suppliers?.length ?? 0}
          unit=""
          status="neutral"
          subtitle="Total registrados"
        />
      </Grid>

      <TabGroup className="mt-8">
        <TabList>
          <Tab icon={BarChart3}>Indicadores</Tab>
          <Tab icon={ShoppingCart}>Órdenes de Compra</Tab>
          <Tab icon={Users}>Proveedores</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <PendingApprovalsTable />
            <Card className="mt-6">
              <Title>Calidad de los Pedidos Generados (NOR_DIS_IND_02)</Title>
              <div className="h-72 mt-4 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                <BarChart3 className="h-10 w-10 text-gray-300" />
              </div>
            </Card>
          </TabPanel>
          
          <TabPanel>
            <Card className="mt-6">
              <Title>Historial de Órdenes</Title>
              <div className="h-96 mt-4 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                <FileText className="h-10 w-10 text-gray-300" />
              </div>
            </Card>
          </TabPanel>

          <TabPanel>
            <Card className="mt-6">
              <Title>Directorio de Proveedores</Title>
              <div className="h-96 mt-4 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                <Users className="h-10 w-10 text-gray-300" />
              </div>
            </Card>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </main>
  );
}
