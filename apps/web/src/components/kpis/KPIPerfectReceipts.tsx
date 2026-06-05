'use client'; 

import React, { useState } from 'react'; 
import { Card, Title, Text, Metric, Flex, Grid, AreaChart, Badge } from '@tremor/react'; 
import { AlertTriangle } from 'lucide-react'; 

export const KPIPerfectReceipts: React.FC = () => { 
  const [selectedYear, setSelectedYear] = useState<number>(2024); 

  const kpiData = {
    period: '2024',
    totalOrdersReceived: 450,
    rejectedOrders: 18,
    rejectedPercentage: 4.0,
  };

  const timeSeriesData = [
    { month: 'Ene', value: 3.5 },
    { month: 'Feb', value: 4.2 },
    { month: 'Mar', value: 3.8 },
    { month: 'Abr', value: 5.0 },
    { month: 'May', value: 4.0 },
  ];

  const chartData = timeSeriesData.map(month => ({ 
    month: month.month, 
    'Tasa de Rechazo (%)': month.value,
  })); 

  const getRejectionColor = (percentage: number): string => { 
    if (percentage <= 5) return 'text-emerald-600'; 
    if (percentage <= 10) return 'text-yellow-600'; 
    return 'text-red-600'; 
  }; 

  return ( 
    <div className="p-6 space-y-6"> 
      <div className="flex justify-between items-center"> 
        <div> 
          <Title>Entregas Perfectamente Recibidas</Title> 
          <Text>KPI - Control de calidad en recepciones</Text> 
        </div> 
        
        <select 
          value={selectedYear} 
          onChange={(e) => setSelectedYear(parseInt(e.target.value))} 
          className="rounded-md border border-gray-300 px-3 py-2 text-black" 
        > 
          <option value={2023}>2023</option> 
          <option value={2024}>2024</option> 
          <option value={2025}>2025</option> 
        </select> 
      </div> 

      <Grid numItemsMd={3} numItemsLg={3} className="gap-6"> 
        <Card> 
          <Flex alignItems="baseline"> 
            <div> 
              <Text>Órdenes Recibidas</Text> 
              <Metric>{kpiData.totalOrdersReceived}</Metric> 
            </div> 
          </Flex> 
        </Card> 

        <Card> 
          <Flex alignItems="baseline"> 
            <div> 
              <Text>Órdenes Rechazadas</Text> 
              <Metric>{kpiData.rejectedOrders}</Metric> 
            </div> 
          </Flex> 
        </Card> 

        <Card> 
          <Flex alignItems="baseline"> 
            <div> 
              <Text>Tasa de Rechazo</Text> 
              <Metric className={getRejectionColor(kpiData.rejectedPercentage)}>{kpiData.rejectedPercentage}%</Metric> 
            </div> 
          </Flex> 
        </Card> 
      </Grid> 

      <Card> 
        <Title>Tendencia Mensual</Title> 
        <AreaChart 
          className="h-80 mt-4" 
          data={chartData} 
          index="month" 
          categories={['Tasa de Rechazo (%)']} 
          colors={['blue']} 
          valueFormatter={(number) => `${number}%`} 
        /> 
      </Card> 

      <div className="flex gap-4"> 
        {kpiData.rejectedPercentage <= 5 && (
          <Badge className="text-green-700 bg-green-50">
            Estado: Óptimo ✓
          </Badge>
        )}
        {kpiData.rejectedPercentage > 5 && kpiData.rejectedPercentage <= 10 && (
          <Badge className="text-yellow-700 bg-yellow-50">
            Estado: Precaución
          </Badge>
        )}
        {kpiData.rejectedPercentage > 10 && (
          <Badge className="text-red-700 bg-red-50">
            Estado: Crítico
          </Badge>
        )}
      </div>
    </div> 
  ); 
} 
