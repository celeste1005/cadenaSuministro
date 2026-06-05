'use client';

import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogPanel,
  NumberInput,
  Select,
  SelectItem,
  Title,
  Text,
  Flex,
  TextInput,
  DatePicker,
} from '@tremor/react';
import { DollarSign, X } from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import { es } from 'date-fns/locale';

interface OperationalCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const COST_TYPES = [
  { value: 'LEASE', label: 'Arrendamiento' },
  { value: 'UTILITIES', label: 'Servicios Públicos' },
  { value: 'MAINTENANCE', label: 'Mantenimiento' },
  { value: 'LABOR', label: 'Mano de Obra Indirecta' },
  { value: 'INSURANCE', label: 'Seguros' },
  { value: 'OTHER', label: 'Otros Gastos' },
];

export function OperationalCostModal({ isOpen, onClose, onSuccess }: OperationalCostModalProps) {
  const [formData, setFormData] = useState({
    warehouseId: '',
    costType: '',
    amount: 0,
    costDate: new Date(),
    description: '',
  });

  const { data: warehouses } = trpc.warehousing.getWarehouses.useQuery();

  // Autocompletar warehouseId
  React.useEffect(() => {
    if (warehouses && warehouses.length > 0 && !formData.warehouseId) {
      setFormData(prev => ({ ...prev, warehouseId: warehouses[0].id }));
    }
  }, [warehouses, formData.warehouseId]);

  const createCost = trpc.warehousing.createOperationalCost.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
      setFormData({
        warehouseId: warehouses?.[0]?.id || '',
        costType: '',
        amount: 0,
        costDate: new Date(),
        description: '',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.warehouseId || !formData.costType || formData.amount <= 0) return;

    createCost.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} static={true}>
      <DialogPanel className="max-w-md">
        <Flex justifyContent="between" alignItems="center">
          <Title>Registrar Costo Operativo</Title>
          <Button variant="light" icon={X} onClick={onClose} />
        </Flex>
        
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Text className="mb-1">Bodega / CEDI</Text>
            <Select 
              value={formData.warehouseId} 
              onValueChange={(val) => setFormData({ ...formData, warehouseId: val })}
              placeholder="Seleccionar bodega..."
            >
              {warehouses?.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name}
                </SelectItem>
              ))}
            </Select>
          </div>

          <div>
            <Text className="mb-1">Tipo de Costo</Text>
            <Select 
              value={formData.costType} 
              onValueChange={(val) => setFormData({ ...formData, costType: val })}
              placeholder="Seleccionar tipo..."
            >
              {COST_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text className="mb-1">Monto (COP)</Text>
              <NumberInput 
                value={formData.amount} 
                onValueChange={(val) => setFormData({ ...formData, amount: val })}
                min={1}
                icon={DollarSign}
              />
            </div>
            <div>
              <Text className="mb-1">Fecha</Text>
              <DatePicker
                value={formData.costDate}
                onValueChange={(val) => val && setFormData({ ...formData, costDate: val })}
                locale={es}
              />
            </div>
          </div>

          <div>
            <Text className="mb-1">Descripción</Text>
            <TextInput 
              placeholder="Detalles adicionales del gasto..." 
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              loading={createCost.isPending} 
              icon={DollarSign}
              type="submit"
              color="blue"
            >
              Guardar Costo
            </Button>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
}
