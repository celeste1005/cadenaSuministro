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
import { Truck, X, DollarSign, MapPin } from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import { es } from 'date-fns/locale';

interface TransportCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const COST_TYPES = [
  { value: 'FUEL', label: 'Combustible' },
  { value: 'MAINTENANCE', label: 'Mantenimiento' },
  { value: 'TOLL', label: 'Peajes' },
  { value: 'SALARY', label: 'Salario Conductor' },
  { value: 'INSURANCE', label: 'Seguros de Carga' },
  { value: 'OTHER', label: 'Otros Gastos' },
];

export function TransportCostModal({ isOpen, onClose, onSuccess }: TransportCostModalProps) {
  const [formData, setFormData] = useState({
    vehicleId: '',
    costType: '',
    amount: 0,
    costDate: new Date(),
    description: '',
    route: '',
  });

  const { data: vehicles } = trpc.transport.getVehicles.useQuery();

  // Autocompletar vehicleId
  React.useEffect(() => {
    if (vehicles && vehicles.length > 0 && !formData.vehicleId) {
      setFormData(prev => ({ ...prev, vehicleId: vehicles[0].id }));
    }
  }, [vehicles, formData.vehicleId]);

  const createCost = trpc.transport.createTransportCost.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
      setFormData({
        vehicleId: vehicles?.[0]?.id || '',
        costType: '',
        amount: 0,
        costDate: new Date(),
        description: '',
        route: '',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.costType || formData.amount <= 0) return;

    createCost.mutate({
      ...formData,
      vehicleId: formData.vehicleId || undefined,
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} static={true}>
      <DialogPanel className="max-w-md">
        <Flex justifyContent="between" alignItems="center">
          <Title>Registrar Costo de Transporte</Title>
          <Button variant="light" icon={X} onClick={onClose} />
        </Flex>
        
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Text className="mb-1">Vehículo (Opcional)</Text>
            <Select 
              value={formData.vehicleId} 
              onValueChange={(val) => setFormData({ ...formData, vehicleId: val })}
              placeholder="Seleccionar vehículo..."
            >
              {vehicles?.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.plate} - {v.model}
                </SelectItem>
              ))}
            </Select>
          </div>

          <div>
            <Text className="mb-1">Tipo de Gasto</Text>
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
            <Text className="mb-1">Ruta / Trayecto</Text>
            <TextInput 
              placeholder="Ej: Bogotá - Medellín" 
              value={formData.route}
              onChange={(e) => setFormData({ ...formData, route: e.target.value })}
              icon={MapPin}
            />
          </div>

          <div>
            <Text className="mb-1">Descripción</Text>
            <TextInput 
              placeholder="Detalles adicionales..." 
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
              icon={Truck}
              type="submit"
              color="orange"
            >
              Guardar Gasto
            </Button>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
}
