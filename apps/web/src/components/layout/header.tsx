'use client';

import React from 'react';
import { User, Bell, Search, LogOut } from 'lucide-react';
import { useAuth } from '../providers/auth-provider';

export default function Header() {
  const { user, isLoading, logout } = useAuth();

  return (
    <header className="bg-white shadow-header h-[72px] flex items-center justify-between px-10 z-10">
      <div className="flex items-center flex-1">
        <div className="relative w-[400px]">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </span>
          <input
            className="block w-full pl-12 pr-4 py-3 border-none rounded-2xl leading-5 bg-gray-50/80 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all sm:text-sm shadow-sm"
            placeholder="Buscar indicadores, reportes o clientes..."
            type="search"
          />
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-white px-1.5 font-sans text-[10px] font-medium text-gray-400 opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <button
          type="button"
          className="p-2.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all relative"
          aria-label="Notificaciones"
        >
          <Bell className="h-6 w-6" />
          <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-danger border-2 border-white" />
        </button>

        <div className="flex items-center space-x-4 border-l border-gray-100 pl-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900 leading-none">
              {isLoading ? '…' : user?.fullName ?? 'Usuario'}
            </p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">
              {isLoading ? '' : user?.role ?? 'Administrador'}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <User className="h-6 w-6" />
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="p-2.5 text-gray-400 hover:text-danger hover:bg-danger/5 rounded-xl transition-all"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
