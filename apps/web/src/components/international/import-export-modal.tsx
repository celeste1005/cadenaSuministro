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
  Divider,
} from '@tremor/react';
import { Globe, X, DollarSign, Package, Ship, Anchor } from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import { Can, Action } from '@/components/auth/can';
import { useAuth } from '@/components/providers/auth-provider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { importExportSchema, type ImportExportFormData } from '@/lib/validations/schemas';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportExportModal({ isOpen, onClose, onSuccess }: ImportExportModalProps) {
  const { can } = useAuth();
  const { data: products } = trpc.inventory.getProducts.useQuery();
  const { data: suppliers } = trpc.purchasing.getSuppliers.useQuery();

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ImportExportFormData>({
    resolver: zodResolver(importExportSchema),
    defaultValues: {
      operationType: 'IMPORT',
      productId: '',
      supplierId: '',
      customerName: '',
      operationDate: new Date(),
      quantity: 0,
      unitCostUsd: 0,
      totalCostUsd: 0,
      freightCostUsd: 0,
      insuranceCostUsd: 0,
      customsDutiesUsd: 0,
      portOfOrigin: '',
      portOfDestination: '',
      containerNumber: '',
      blNumber: '',
      status: 'IN_TRANSIT',
      notes: '',
    },
  });

  const operationType = watch('operationType');
  const quantity = watch('quantity');
  const unitCostUsd = watch('unitCostUsd');
  const freightCostUsd = watch('freightCostUsd');
  const insuranceCostUsd = watch('insuranceCostUsd');
  const customsDutiesUsd = watch('customsDutiesUsd');

  // Calcular costo total automáticamente
  React.useEffect(() => {
    const total = (quantity * unitCostUsd) + 
                  (freightCostUsd || 0) + 
                  (insuranceCostUsd || 0) + 
                  (customsDutiesUsd || 0);
    setValue('totalCostUsd', total);
  }, [quantity, unitCostUsd, freightCostUsd, insuranceCostUsd, customsDutiesUsd, setValue]);

  const createOperation = trpc.internationalTrade.createOperation.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
      reset({
        operationType: 'IMPORT',
        productId: '',
        supplierId: '',
        customerName: '',
        operationDate: new Date(),
        quantity: 0,
        unitCostUsd: 0,
        totalCostUsd: 0,
        freightCostUsd: 0,
        insuranceCostUsd: 0,
        customsDutiesUsd: 0,
        portOfOrigin: '',
        portOfDestination: '',
        containerNumber: '',
        blNumber: '',
        status: 'IN_TRANSIT',
        notes: '',
      });
    },
  });

  const onSubmit = (data: ImportExportFormData) => {
    createOperation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} static={true} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <DialogPanel className="relative z-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-kpi shadow-kpi p-6">
        <Flex justifyContent="between" alignItems="center">
          <Title className="text-xl font-bold text-gray-900">{operationType === 'IMPORT' ? 'Registrar Importación' : 'Registrar Exportación'}</Title>
          <Button variant="light" icon={X} onClick={onClose} className="hover:bg-gray-100" />
        </Flex>
        
        <form onSubmit={handleFormSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text className="mb-1">Tipo de Operación</Text>
              <Select 
                value={operationType} 
                onValueChange={(val: any) => setValue('operationType', val)}
              >
                <SelectItem value="IMPORT">Importación</SelectItem>
                <SelectItem value="EXPORT">Exportación</SelectItem>
              </Select>
              {errors.operationType && (
                <Text className="text-red-500 text-sm mt-1">{errors.operationType.message}</Text>
              )}
            </div>
            <div>
              <Text className="mb-1">Fecha</Text>
              <DatePicker
                value={watch('operationDate')}
                onValueChange={(val) => val && setValue('operationDate', val)}
              />
              {errors.operationDate && (
                <Text className="text-red-500 text-sm mt-1">{errors.operationDate.message}</Text>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text className="mb-1">Producto</Text>
              <Select 
                value={watch('productId')} 
                onValueChange={(val) => setValue('productId', val)}
                placeholder="Seleccionar producto..."
              >
                {products?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </Select>
              {errors.productId && (
                <Text className="text-red-500 text-sm mt-1">{errors.productId.message}</Text>
              )}
            </div>
            {operationType === 'IMPORT' ? (
              <div>
                <Text className="mb-1">Proveedor Extranjero</Text>
                <Select 
                  value={watch('supplierId')} 
                  onValueChange={(val) => setValue('supplierId', val)}
                  placeholder="Seleccionar proveedor..."
                >
                  {suppliers?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </Select>
                {errors.supplierId && (
                  <Text className="text-red-500 text-sm mt-1">{errors.supplierId.message}</Text>
                )}
              </div>
            ) : (
              <div>
                <Text className="mb-1">Cliente Internacional</Text>
                <TextInput 
                  placeholder="Nombre del cliente..." 
                  {...register('customerName')}
                />
                {errors.customerName && (
                  <Text className="text-red-500 text-sm mt-1">{errors.customerName.message}</Text>
                )}
              </div>
            )}
          </div>

          <Divider>Costos y Cantidades (USD)</Divider>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Text className="mb-1">Cantidad</Text>
              <NumberInput 
                value={quantity} 
                onValueChange={(val) => setValue('quantity', val)}
                min={1}
              />
              {errors.quantity && (
                <Text className="text-red-500 text-sm mt-1">{errors.quantity.message}</Text>
              )}
            </div>
            <div>
              <Text className="mb-1">Costo Unitario</Text>
              <NumberInput 
                value={unitCostUsd} 
                onValueChange={(val) => setValue('unitCostUsd', val)}
                min={0}
                icon={DollarSign}
              />
            </div>
            <div>
              <Text className="mb-1">Flete</Text>
              <NumberInput 
                value={freightCostUsd} 
                onValueChange={(val) => setValue('freightCostUsd', val)}
                min={0}
                icon={Ship}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Text className="mb-1">Seguro</Text>
              <NumberInput 
                value={insuranceCostUsd} 
                onValueChange={(val) => setValue('insuranceCostUsd', val)}
                min={0}
              />
            </div>
            <div>
              <Text className="mb-1">Aranceles</Text>
              <NumberInput 
                value={customsDutiesUsd} 
                onValueChange={(val) => setValue('customsDutiesUsd', val)}
                min={0}
              />
            </div>
            <div>
              <Text className="mb-1 font-bold">Costo Total DDP</Text>
              <div className="p-2 bg-gray-100 rounded text-center font-bold text-gray-900">
                ${watch('totalCostUsd').toLocaleString()}
              </div>
            </div>
          </div>

          <Divider>Logística Internacional</Divider>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text className="mb-1">Puerto Origen</Text>
              <TextInput 
                placeholder="Ej: Shanghai, China" 
                {...register('portOfOrigin')}
                icon={Anchor}
              />
            </div>
            <div>
              <Text className="mb-1">Puerto Destino</Text>
              <TextInput 
                placeholder="Ej: Buenaventura, Colombia" 
                {...register('portOfDestination')}
                icon={Anchor}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text className="mb-1">Contenedor / BL</Text>
              <TextInput 
                placeholder="Nº Contenedor o Bill of Lading" 
                {...register('containerNumber')}
              />
            </div>
            <div>
              <Text className="mb-1">Estado</Text>
              <Select 
                value={watch('status')} 
                onValueChange={(val) => setValue('status', val as any)}
              >
                <SelectItem value="IN_TRANSIT">En Tránsito</SelectItem>
                <SelectItem value="PORT_OF_ORIGIN">En Puerto Origen</SelectItem>
                <SelectItem value="CUSTOMS">En Aduana</SelectItem>
                <SelectItem value="DELIVERED">Entregado</SelectItem>
              </Select>
            </div>
          </div>

          <div>
            <Text className="mb-1">Notas</Text>
            <TextInput 
              placeholder="Observaciones adicionales..." 
              {...register('notes')}
            />
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Can action={Action.Create} subject="ImportExportRecord" fallback={
              <Button disabled color="gray">
                Sin permisos
              </Button>
            }>
              <Button 
                loading={createOperation.isPending} 
                icon={Globe}
                type="submit"
                color="cyan"
              >
                Confirmar Operación
              </Button>
            </Can>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
}
