'use client';

import React, { useState } from 'react';
import { 
  Grid, 
  Title, 
  Text, 
  TabGroup, 
  TabList, 
  Tab, 
  TabPanels, 
  TabPanel, 
  Card,
  Flex,
  Select,
  SelectItem,
  Badge,
  Divider,
  List,
  ListItem
} from '@tremor/react';
import { 
  ShoppingCart, 
  Package, 
  Truck, 
  Users, 
  Globe, 
  Factory,
  Filter,
  ClipboardList,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Bell,
  CheckCircle
} from 'lucide-react';
import { KPICard } from '@/components/ui/kpi-card';
import { cn } from '@/lib/utils';
import { 
  AreaChart,
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Label
} from 'recharts';

export default function DashboardPage() {
  const [selectedTaxonomy, setSelectedTaxonomy] = useState<string>('all');

  const chartData = [
    { name: 'Lun', value: 82 },
    { name: 'Mar', value: 85 },
    { name: 'Mié', value: 89 },
    { name: 'Jue', value: 87 },
    { name: 'Vie', value: 91 },
    { name: 'Sáb', value: 94 },
    { name: 'Dom', value: 89 },
  ];

  const distributionData = [
    { name: 'Compras', value: 28, color: '#4F46E5' },
    { name: 'Inventarios', value: 24, color: '#2563EB' },
    { name: 'Producción', value: 18, color: '#10B981' },
    { name: 'Transporte', value: 16, color: '#F59E0B' },
    { name: 'Otros', value: 14, color: '#E2E8F0' },
  ];

  return (
    <main className="p-6 sm:p-10 bg-background min-h-screen">
      <Flex alignItems="center" justifyContent="between" className="mb-10">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Panel de Control BI Logístico</h1>
          <p className="text-gray-400 font-medium">Visualización de 28 Indicadores de Gestión Logística</p>
        </div>
        
        <div className="flex items-center space-x-3 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
          <Filter className="text-gray-400 h-4 w-4 ml-3" />
          <Select 
            value={selectedTaxonomy} 
            onValueChange={setSelectedTaxonomy}
            className="border-none focus:ring-0 w-48"
          >
            <SelectItem value="all">Todas las Clases</SelectItem>
            <SelectItem value="UTILIZATION">Utilización</SelectItem>
            <SelectItem value="PERFORMANCE">Rendimiento</SelectItem>
            <SelectItem value="PRODUCTIVITY">Productividad</SelectItem>
          </Select>
        </div>
      </Flex>

      {/* Resumen de KPIs Principales */}
      <Grid numItemsMd={2} numItemsLg={4} className="gap-8 mb-10">
        <KPICard
          title="Entregas Perfectas Recibidas"
          value={92.5}
          unit="%"
          status="good"
          icon={<ShoppingCart className="h-5 w-5" />}
          subtitle="NOR_DIS_IND_01"
        />
        <KPICard
          title="Exactitud Inventarios"
          value={95.8}
          unit="%"
          status="good"
          icon={<Package className="h-5 w-5" />}
          subtitle="NOR_DIS_IND_11"
        />
        <KPICard
          title="Costo Transporte vs Ventas"
          value={8.2}
          unit="%"
          status="good"
          direction="down"
          icon={<Truck className="h-5 w-5" />}
          subtitle="NOR_DIS_IND_18"
        />
        <KPICard
          title="Entregas Perfectas"
          value={94.1}
          unit="%"
          status="good"
          icon={<Users className="h-5 w-5" />}
          subtitle="NOR_DIS_IND_24"
        />
      </Grid>

      <TabGroup className="mt-6">
        <TabList className="bg-transparent border-none space-x-2">
          <Tab className="rounded-full px-6 py-2.5 border-none data-[state=selected]:bg-primary data-[state=selected]:text-white data-[state=selected]:shadow-lg data-[state=selected]:shadow-primary/20 hover:bg-gray-100 transition-all">
            <div className="flex items-center space-x-2">
              <ClipboardList className="h-4 w-4" />
              <span className="font-bold text-xs uppercase tracking-wider">Resumen</span>
            </div>
          </Tab>
          <Tab className="rounded-full px-6 py-2.5 border-none data-[state=selected]:bg-primary data-[state=selected]:text-white data-[state=selected]:shadow-lg data-[state=selected]:shadow-primary/20 hover:bg-gray-100 transition-all">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="font-bold text-xs uppercase tracking-wider">Compras</span>
            </div>
          </Tab>
          <Tab className="rounded-full px-6 py-2.5 border-none data-[state=selected]:bg-primary data-[state=selected]:text-white data-[state=selected]:shadow-lg data-[state=selected]:shadow-primary/20 hover:bg-gray-100 transition-all">
            <div className="flex items-center space-x-2">
              <Factory className="h-4 w-4" />
              <span className="font-bold text-xs uppercase tracking-wider">Producción</span>
            </div>
          </Tab>
          <Tab className="rounded-full px-6 py-2.5 border-none data-[state=selected]:bg-primary data-[state=selected]:text-white data-[state=selected]:shadow-lg data-[state=selected]:shadow-primary/20 hover:bg-gray-100 transition-all">
            <div className="flex items-center space-x-2">
              <Truck className="h-4 w-4" />
              <span className="font-bold text-xs uppercase tracking-wider">Transporte</span>
            </div>
          </Tab>
          <Tab className="rounded-full px-6 py-2.5 border-none data-[state=selected]:bg-primary data-[state=selected]:text-white data-[state=selected]:shadow-lg data-[state=selected]:shadow-primary/20 hover:bg-gray-100 transition-all">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="font-bold text-xs uppercase tracking-wider">Servicio al Cliente</span>
            </div>
          </Tab>
          <Tab className="rounded-full px-6 py-2.5 border-none data-[state=selected]:bg-primary data-[state=selected]:text-white data-[state=selected]:shadow-lg data-[state=selected]:shadow-primary/20 hover:bg-gray-100 transition-all">
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span className="font-bold text-xs uppercase tracking-wider">Comercio Exterior</span>
            </div>
          </Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            {/* Fila Central: Estado General y Alertas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
              <Card className="lg:col-span-2 rounded-kpi shadow-kpi border-none p-8">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900">Estado General</h3>
                      <p className="text-sm text-gray-400 font-medium">Desempeño consolidado del ecosistema</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-primary uppercase tracking-widest">Salud del Sistema</span>
                    <div className="flex items-center text-success font-black text-sm mt-1">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      OPERATIVO
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
                  <div className="md:col-span-4 flex justify-center">
                    <div className="relative h-48 w-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[{ value: 89 }, { value: 11 }]}
                            innerRadius={70}
                            outerRadius={85}
                            startAngle={90}
                            endAngle={450}
                            dataKey="value"
                          >
                            <Cell fill="#4F46E5" stroke="none" />
                            <Cell fill="#F1F5F9" stroke="none" />
                            <Label 
                              value="89%" 
                              position="center" 
                              className="text-4xl font-black fill-gray-900" 
                            />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                        Desempeño Global
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-8 space-y-6">
                    <p className="text-gray-500 leading-relaxed font-medium">
                      El sistema está operando dentro de los parámetros normales. Todos los indicadores principales muestran desempeño satisfactorio con una tendencia positiva del <span className="text-primary font-black">+2.4%</span> esta semana.
                    </p>
                    
                    <div className="h-32 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} 
                          />
                          <Tooltip 
                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#4F46E5" 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#colorValue)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="space-y-8">
                <Card className="rounded-kpi shadow-kpi border-none p-8 bg-success/5 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 h-24 w-24 bg-success/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                      <Bell className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900">Alertas Activas</h3>
                      <p className="text-sm text-success/70 font-bold">Estado: Saludable</p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 bg-white/50 rounded-2xl border border-success/10">
                    <CheckCircle className="h-5 w-5 text-success mr-3" />
                    <span className="text-sm font-bold text-gray-700">Sistema operando al 100%</span>
                  </div>
                </Card>

                <Card className="rounded-kpi shadow-kpi border-none p-8">
                  <h3 className="text-lg font-black text-gray-900 mb-6">Distribución por Categoría</h3>
                  <div className="flex items-center space-x-6">
                    <div className="h-32 w-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={distributionData}
                            innerRadius={40}
                            outerRadius={55}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {distributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-2">
                      {distributionData.map((item) => (
                        <div key={item.name} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full mr-2" style={{backgroundColor: item.color}} />
                            <span className="text-[10px] font-bold text-gray-400 uppercase">{item.name}</span>
                          </div>
                          <span className="text-xs font-black text-gray-900">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Aprobaciones Pendientes Rediseñado */}
            <Card className="mt-10 rounded-kpi shadow-kpi border-none p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-gray-900">Aprobaciones Pendientes</h3>
                  <p className="text-sm text-gray-400 font-medium">Gestión de órdenes de compra que requieren revisión gerencial</p>
                </div>
                <button className="bg-primary text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-transform active:scale-95">
                  Ver Todo
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { label: 'Pendientes', value: 12, color: 'text-primary' },
                  { label: 'En Revisión', value: 5, color: 'text-warning' },
                  { label: 'Aprobadas Hoy', value: 3, color: 'text-success' },
                  { label: 'Rechazadas', value: 2, color: 'text-danger' },
                ].map((stat, i) => (
                  <div key={stat.label} className="space-y-2">
                    <span className="text-4xl font-black text-gray-900">{stat.value}</span>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                    <div className="h-1 w-full bg-gray-50 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full", i === 0 ? 'bg-primary' : i === 1 ? 'bg-warning' : i === 2 ? 'bg-success' : 'bg-danger')} 
                        style={{width: `${(stat.value / 22) * 100}%`}} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabPanel>

          {/* Compras */}
          <TabPanel>
            <Card className="mt-10 rounded-kpi shadow-kpi border-none p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-gray-900">Indicadores de Compras</h3>
                  <p className="text-sm text-gray-400 font-medium">Análisis detallado de adquisiciones y proveedores</p>
                </div>
              </div>
              <div className="h-60 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50">
                <div className="flex flex-col items-center">
                  <ShoppingCart className="h-10 w-10 text-gray-200 mb-2" />
                  <Text className="text-gray-400 font-bold uppercase tracking-widest text-xs">Módulo en Optimización Visual</Text>
                </div>
              </div>
            </Card>
          </TabPanel>

          {/* Inventarios */}
          <TabPanel>
            <Card className="mt-10 rounded-kpi shadow-kpi border-none p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-gray-900">Indicadores de Inventarios</h3>
                  <p className="text-sm text-gray-400 font-medium">Control de existencias y exactitud de stock</p>
                </div>
              </div>
              <div className="h-60 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50">
                <div className="flex flex-col items-center">
                  <Package className="h-10 w-10 text-gray-200 mb-2" />
                  <Text className="text-gray-400 font-bold uppercase tracking-widest text-xs">Módulo en Optimización Visual</Text>
                </div>
              </div>
            </Card>
          </TabPanel>

          {/* Producción */}
          <TabPanel>
            <Card className="mt-10 rounded-kpi shadow-kpi border-none p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-gray-900">Indicadores de Producción</h3>
                  <p className="text-sm text-gray-400 font-medium">Eficiencia y rendimiento de planta</p>
                </div>
              </div>
              <div className="h-60 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50">
                <div className="flex flex-col items-center">
                  <Factory className="h-10 w-10 text-gray-200 mb-2" />
                  <Text className="text-gray-400 font-bold uppercase tracking-widest text-xs">Módulo en Optimización Visual</Text>
                </div>
              </div>
            </Card>
          </TabPanel>

          {/* Transporte */}
          <TabPanel>
            <Card className="mt-10 rounded-kpi shadow-kpi border-none p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-gray-900">Indicadores de Transporte</h3>
                  <p className="text-sm text-gray-400 font-medium">Gestión de flota y costos de distribución</p>
                </div>
              </div>
              <div className="h-60 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50">
                <div className="flex flex-col items-center">
                  <Truck className="h-10 w-10 text-gray-200 mb-2" />
                  <Text className="text-gray-400 font-bold uppercase tracking-widest text-xs">Módulo en Optimización Visual</Text>
                </div>
              </div>
            </Card>
          </TabPanel>

          {/* Servicio al Cliente */}
          <TabPanel>
            <Card className="mt-10 rounded-kpi shadow-kpi border-none p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-gray-900">Indicadores de Servicio al Cliente</h3>
                  <p className="text-sm text-gray-400 font-medium">Satisfacción y calidad de entregas finales</p>
                </div>
              </div>
              <div className="h-60 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50">
                <div className="flex flex-col items-center">
                  <Users className="h-10 w-10 text-gray-200 mb-2" />
                  <Text className="text-gray-400 font-bold uppercase tracking-widest text-xs">Módulo en Optimización Visual</Text>
                </div>
              </div>
            </Card>
          </TabPanel>

          {/* Comercio Exterior */}
          <TabPanel>
            <Card className="mt-10 rounded-kpi shadow-kpi border-none p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-gray-900">Indicadores de Comercio Exterior</h3>
                  <p className="text-sm text-gray-400 font-medium">Importaciones, exportaciones y logística global</p>
                </div>
              </div>
              <div className="h-60 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50">
                <div className="flex flex-col items-center">
                  <Globe className="h-10 w-10 text-gray-200 mb-2" />
                  <Text className="text-gray-400 font-bold uppercase tracking-widest text-xs">Módulo en Optimización Visual</Text>
                </div>
              </div>
            </Card>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </main>
  );
}
