'use client';

import React from 'react';
import {
  Button,
  Dialog,
  DialogPanel,
  TextInput,
  NumberInput,
  Select,
  SelectItem,
  Title,
  Text,
  Flex,
} from '@tremor/react';
import { PlusCircle, X } from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import { Can, Action } from '@/components/auth/can';
import { useAuth } from '@/components/providers/auth-provider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { inventoryMovementSchema, type InventoryMovementFormData } from '@/lib/validations/schemas';

interface MovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function MovementModal({ isOpen, onClose, onSuccess }: MovementModalProps) {
  const { can } = useAuth();
  const { data: products } = trpc.inventory.getProducts.useQuery();
  const { data: warehouses } = trpc.inventory.getWarehouses.useQuery();

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<InventoryMovementFormData>({
    resolver: zodResolver(inventoryMovementSchema),
    defaultValues: {
      productId: '',
      warehouseId: '', 
      type: 'IN',
      quantity: 0,
      reference: '',
      notes: '',
    },
  });

  // Update warehouseId once warehouses are loaded
  React.useEffect(() => {
    if (warehouses && warehouses.length > 0 && !watch('warehouseId')) {
      setValue('warehouseId', warehouses[0].id);
    }
  }, [warehouses, setValue, watch]);

  const createMovement = trpc.inventory.createMovement.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
      reset({
        productId: '',
        warehouseId: warehouses?.[0]?.id || '',
        type: 'IN',
        quantity: 0,
        reference: '',
        notes: '',
      });
    },
  });

  const onSubmit = (data: InventoryMovementFormData) => {
    createMovement.mutate({
      ...data,
      quantity: Number(data.quantity),
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} static={true} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <DialogPanel className="relative z-10 max-w-md w-full max-h-[90vh] overflow-y-auto bg-white rounded-kpi shadow-kpi p-6">
        <Flex justifyContent="between" alignItems="center">
          <Title className="text-xl font-bold text-gray-900">Registrar Movimiento</Title>
          <Button variant="light" icon={X} onClick={onClose} className="hover:bg-gray-100" />
        </Flex>
        
        <form onSubmit={handleFormSubmit(onSubmit)} className="mt-6 space-y-4">
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

          <div>
            <Text className="mb-1">Bodega</Text>
            <Select 
              value={watch('warehouseId')} 
              onValueChange={(val) => setValue('warehouseId', val)}
              placeholder="Seleccionar bodega..."
            >
              {warehouses?.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name}
                </SelectItem>
              ))}
            </Select>
            {errors.warehouseId && (
              <Text className="text-red-500 text-sm mt-1">{errors.warehouseId.message}</Text>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text className="mb-1">Tipo</Text>
              <Select 
                value={watch('type')} 
                onValueChange={(val: any) => setValue('type', val)}
              >
                <SelectItem value="IN">Entrada (+)</SelectItem>
                <SelectItem value="OUT">Salida (-)</SelectItem>
                <SelectItem value="ADJUSTMENT">Ajuste</SelectItem>
                <SelectItem value="TRANSFER">Traslado</SelectItem>
              </Select>
              {errors.type && (
                <Text className="text-red-500 text-sm mt-1">{errors.type.message}</Text>
              )}
            </div>
            <div>
              <Text className="mb-1">Cantidad</Text>
              <NumberInput 
                value={watch('quantity')} 
                onValueChange={(val) => setValue('quantity', val)}
                min={1}
              />
              {errors.quantity && (
                <Text className="text-red-500 text-sm mt-1">{errors.quantity.message}</Text>
              )}
            </div>
          </div>

          <div>
            <Text className="mb-1">Referencia / Documento</Text>
            <TextInput 
              placeholder="Ej: OC-123, Factura 45..." 
              {...register('reference')}
            />
          </div>

          <div>
            <Text className="mb-1">Notas</Text>
            <TextInput 
              placeholder="Observaciones adicionales" 
              {...register('notes')}
            />
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Can action={Action.Create} subject="InventoryMovement" fallback={
              <Button disabled color="gray">
                Sin permisos
              </Button>
            }>
              <Button 
                loading={createMovement.isPending} 
                icon={PlusCircle}
                type="submit"
              >
                Confirmar
              </Button>
            </Can>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
}
