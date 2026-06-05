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
    <Card className="mt-4 flex flex-col items-center justify-center p-10 border-dashed">
      <CheckCircle className="h-10 w-10 text-emerald-500 mb-2" />
      <Title>Todo al día</Title>
      <Text>No hay órdenes de compra pendientes de aprobación.</Text>
    </Card>
  );
};
