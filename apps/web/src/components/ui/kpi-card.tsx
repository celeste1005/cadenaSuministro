'use client'; 
 
 import React from 'react';
 import { Metric, Text } from '@tremor/react';
 import { 
   TrendingUp, 
   TrendingDown, 
   Minus, 
   AlertCircle, 
   CheckCircle, 
   Info,
   ArrowUpRight,
   ArrowDownRight
 } from 'lucide-react'; 
 import { cn } from '../../lib/utils'; 
 import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts';

 interface KPICardProps { 
   title: string; 
   value: number | string; 
   unit?: string; 
   target?: number; 
   previousValue?: number; 
   status?: 'good' | 'bad' | 'neutral' | 'warning'; 
   direction?: 'up' | 'down'; 
   icon?: React.ReactNode; 
   color?: any; 
   loading?: boolean; 
   onClick?: () => void; 
   className?: string; 
   subtitle?: string; 
   trend?: number; 
   trendLabel?: string; 
   sparklineData?: { value: number }[];
 } 

 
 export const KPICard: React.FC<KPICardProps> = ({ 
   title, 
   value, 
   unit, 
   target, 
   previousValue, 
   status = 'neutral', 
   direction = 'up', 
   icon, 
   color = 'blue', 
   loading = false, 
   onClick, 
   className, 
   subtitle, 
   trend = 1.2, 
   trendLabel = 'vs periodo anterior', 
   sparklineData,
 }) => { 
   
   const getStatusColor = () => { 
     switch (status) { 
       case 'good': return 'text-success bg-success/10'; 
       case 'bad': return 'text-danger bg-danger/10'; 
       case 'warning': return 'text-warning bg-warning/10'; 
       default: return 'text-primary bg-primary/10'; 
     } 
   }; 

   const getStatusChartColor = () => {
     switch (status) {
       case 'good': return '#10B981';
       case 'bad': return '#EF4444';
       case 'warning': return '#F59E0B';
       default: return '#4F46E5';
     }
   };
 
   const getTrendColor = () => { 
     if (trend > 0) return status === 'good' ? 'text-success bg-success/10' : 'text-danger bg-danger/10'; 
     if (trend < 0) return status === 'bad' ? 'text-success bg-success/10' : 'text-danger bg-danger/10'; 
     return 'text-gray-500 bg-gray-50'; 
   }; 
 
   const formatValue = (val: number | string): string => { 
     if (typeof val === 'string') return val; 
     if (unit === '%') return `${val.toFixed(1)}%`; 
     if (unit === 'currency' || unit === 'COP') return new Intl.NumberFormat('es-CO', { 
       style: 'currency', 
       currency: 'COP', 
       minimumFractionDigits: 0, 
     }).format(val); 
     return val.toLocaleString(); 
   }; 
 
   return ( 
     <div 
       className={cn( 
         "relative bg-white p-6 rounded-kpi shadow-kpi transition-all duration-300 hover:shadow-kpi-hover hover:-translate-y-1.5 cursor-pointer group border border-gray-50", 
         className 
       )} 
       onClick={onClick} 
     > 
       {/* Header */} 
       <div className="flex justify-between items-start mb-4"> 
         <div className="flex flex-col">
            <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{title}</Text> 
            {subtitle && ( 
               <Text className="text-[10px] font-bold text-gray-300 mt-0.5">{subtitle}</Text> 
            )} 
         </div>
         {icon && ( 
           <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110 duration-300 shadow-sm", getStatusColor())}> 
             {icon} 
           </div> 
         )} 
       </div> 
 
       {/* Value and Trend */} 
       <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <Metric className={cn("text-3xl font-black text-gray-900 tracking-tighter", loading && "animate-pulse")}> 
              {loading ? '---' : formatValue(value)} 
            </Metric> 
            
            <div className="flex items-center space-x-2 mt-2">
              <div className={cn("flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold", getTrendColor())}>
                {trend > 0 ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                {Math.abs(trend).toFixed(1)}%
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{trendLabel}</span>
            </div>
          </div>

          {/* Sparkline Chart */}
          <div className="h-12 w-24 -mb-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getStatusChartColor()} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={getStatusChartColor()} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={getStatusChartColor()} 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill={`url(#gradient-${title})`} 
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
       </div> 
     </div> 
   ); 
 }; 
