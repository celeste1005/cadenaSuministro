'use client';

import React from 'react';
import {
  Card,
  Title,
  Text,
} from '@tremor/react';
import { CheckCircle } from 'lucide-react';

export const PendingApprovalsTable = () => {
  // Placeholder component - to be implemented with actual tRPC integration later
  return (
    <Card className="mt-4 flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-200 rounded-kpi shadow-kpi bg-gradient-to-br from-white to-gray-50">
      <div className="relative">
        <div className="absolute -inset-2 bg-emerald-500/10 rounded-full blur-xl" />
        <CheckCircle className="h-12 w-12 text-emerald-500 mb-4 relative" />
      </div>
      <Title className="text-xl font-bold text-gray-900">Todo al día</Title>
      <Text className="text-gray-500 mt-2 text-center">No hay órdenes de compra pendientes de aprobación en este momento.</Text>
    </Card>
  );
};
