'use client';

import React from 'react';
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
import { Can, Action } from '@/components/auth/can';
import { useAuth } from '@/components/providers/auth-provider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transportCostSchema, type TransportCostFormData } from '@/lib/validations/schemas';

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
  const { can } = useAuth();
  const { data: vehicles } = trpc.transport.getVehicles.useQuery();

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<TransportCostFormData>({
    resolver: zodResolver(transportCostSchema),
    defaultValues: {
      vehicleId: '',
      costType: undefined,
      amount: 0,
      costDate: new Date(),
      route: '',
      description: '',
    },
  });

  // Autocompletar vehicleId
  React.useEffect(() => {
    if (vehicles && vehicles.length > 0 && !watch('vehicleId')) {
      setValue('vehicleId', vehicles[0].id);
    }
  }, [vehicles, setValue, watch]);

  const createCost = trpc.transport.createTransportCost.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
      reset({
        vehicleId: vehicles?.[0]?.id || '',
        costType: undefined,
        amount: 0,
        costDate: new Date(),
        route: '',
        description: '',
      });
    },
  });

  const onSubmit = (data: TransportCostFormData) => {
    createCost.mutate(data);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} static={true} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <DialogPanel className="relative z-10 max-w-md w-full max-h-[90vh] overflow-y-auto bg-white rounded-kpi shadow-kpi p-6">
        <Flex justifyContent="between" alignItems="center">
          <Title className="text-xl font-bold text-gray-900">Registrar Costo de Transporte</Title>
          <Button variant="light" icon={X} onClick={onClose} className="hover:bg-gray-100" />
        </Flex>
        
        <form onSubmit={handleFormSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <Text className="mb-1">Vehículo (Opcional)</Text>
            <Select 
              value={watch('vehicleId')} 
              onValueChange={(val) => setValue('vehicleId', val)}
              placeholder="Seleccionar vehículo..."
            >
              {vehicles?.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.plateNumber} - {v.model}
                </SelectItem>
              ))}
            </Select>
          </div>

          <div>
            <Text className="mb-1">Tipo de Gasto</Text>
            <Select 
              value={watch('costType')} 
              onValueChange={(val) => setValue('costType', val as any)}
              placeholder="Seleccionar tipo..."
            >
              {COST_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </Select>
            {errors.costType && (
              <Text className="text-red-500 text-sm mt-1">{errors.costType.message}</Text>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text className="mb-1">Monto (COP)</Text>
              <NumberInput 
                value={watch('amount')} 
                onValueChange={(val) => setValue('amount', val)}
                min={1}
                icon={DollarSign}
              />
              {errors.amount && (
                <Text className="text-red-500 text-sm mt-1">{errors.amount.message}</Text>
              )}
            </div>
            <div>
              <Text className="mb-1">Fecha</Text>
              <DatePicker
                value={watch('costDate')}
                onValueChange={(val) => val && setValue('costDate', val)}
              />
              {errors.costDate && (
                <Text className="text-red-500 text-sm mt-1">{errors.costDate.message}</Text>
              )}
            </div>
          </div>

          <div>
            <Text className="mb-1">Ruta / Trayecto</Text>
            <TextInput 
              placeholder="Ej: Bogotá - Medellín" 
              {...register('route')}
              icon={MapPin}
            />
          </div>

          <div>
            <Text className="mb-1">Descripción</Text>
            <TextInput 
              placeholder="Detalles adicionales..." 
              {...register('description')}
            />
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Can action={Action.Create} subject="TransportCost" fallback={
              <Button disabled color="gray">
                Sin permisos
              </Button>
            }>
              <Button 
                loading={createCost.isPending} 
                icon={Truck}
                type="submit"
                color="orange"
              >
                Guardar Gasto
              </Button>
            </Can>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
}
