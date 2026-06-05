'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Truck, 
  Users, 
  Globe, 
  Factory,
  Settings,
  FileText
} from 'lucide-react';
import { clsx } from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Compras', href: '/dashboard/purchasing', icon: ShoppingCart },
  { name: 'Inventarios', href: '/dashboard/operations', icon: Package },
  { name: 'Producción', href: '/dashboard/admin', icon: Factory },
  { name: 'Transporte', href: '/dashboard/transport', icon: Truck },
  { name: 'Servicio al Cliente', href: '/dashboard/customer-service', icon: Users },
  { name: 'Comercio Exterior', href: '/dashboard/international', icon: Globe },
  { name: 'Reportes', href: '/reports', icon: FileText },
  { name: 'Configuración', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-gradient-to-b from-bi-dark to-bi-blue text-white shadow-2xl">
      <div className="flex flex-col flex-grow pt-8 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-6 mb-10 space-x-3">
          <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md">
            <LayoutDashboard className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">BI Logístico</span>
        </div>
        <div className="mt-5 flex-1 flex flex-col">
          <nav className="flex-1 px-4 pb-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    isActive
                      ? 'bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg shadow-primary/20'
                      : 'text-white/70 hover:text-white hover:bg-white/5 hover:translate-x-1',
                    'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-250 ease-in-out'
                  )}
                >
                  <item.icon
                    className={clsx(
                      isActive ? 'text-white' : 'text-white/50 group-hover:text-white',
                      'mr-3 flex-shrink-0 h-5 w-5 transition-colors'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                  {isActive && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* User profile / Bottom section */}
        <div className="p-4 mt-auto">
          <div className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-indigo-400 border-2 border-white/20 flex items-center justify-center text-xs font-bold">
                AD
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate">Administrador</p>
                <p className="text-[10px] text-white/50 uppercase tracking-widest">Premium Plan</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
