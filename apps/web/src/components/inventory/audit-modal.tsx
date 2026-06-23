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
} from '@tremor/react';
import { ClipboardCheck, X } from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import { Can, Action } from '@/components/auth/can';
import { useAuth } from '@/components/providers/auth-provider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { physicalInventorySchema, type PhysicalInventoryFormData } from '@/lib/validations/schemas';

interface AuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuditModal({ isOpen, onClose, onSuccess }: AuditModalProps) {
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
  } = useForm<PhysicalInventoryFormData>({
    resolver: zodResolver(physicalInventorySchema),
    defaultValues: {
      productId: '',
      warehouseId: '',
      systemQuantity: 0,
      physicalQuantity: 0,
      notes: '',
    },
  });

  // Autocompletar warehouseId
  React.useEffect(() => {
    if (warehouses && warehouses.length > 0 && !watch('warehouseId')) {
      setValue('warehouseId', warehouses[0].id);
    }
  }, [warehouses, setValue, watch]);

  // Actualizar cantidad del sistema cuando cambia el producto
  // TODO: Calculate actual stock from inventory movements instead of using a non-existent field
  // For now, default to 0 - this needs to be calculated from InventoryMovement records
  React.useEffect(() => {
    const productId = watch('productId');
    if (productId && products) {
      const product = products.find(p => p.id === productId);
      if (product) {
        // currentStock field doesn't exist in Product model
        // Stock should be calculated from inventory movements
        setValue('systemQuantity', 0);
      }
    }
  }, [watch('productId'), products, setValue]);

  const createAudit = trpc.inventory.createPhysicalInventory.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
      reset({
        productId: products?.[0]?.id || '',
        warehouseId: warehouses?.[0]?.id || '',
        systemQuantity: 0,
        physicalQuantity: 0,
        notes: '',
      });
    },
  });

  const onSubmit = (data: PhysicalInventoryFormData) => {
    // TODO: Get actual user ID from auth context
    // For now, this will need to be passed as a prop or retrieved from auth provider
    const userId = 'current-user-id'; // This should come from auth context

    createAudit.mutate({
      ...data,
      countedById: userId,
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} static={true} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <DialogPanel className="relative z-10 max-w-md w-full max-h-[90vh] overflow-y-auto bg-white rounded-kpi shadow-kpi p-6">
        <Flex justifyContent="between" alignItems="center">
          <Title className="text-xl font-bold text-gray-900">Auditoría de Inventario</Title>
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
                  {p.name} (SKU: {p.sku})
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
              <Text className="mb-1">Cant. Sistema</Text>
              <NumberInput 
                value={watch('systemQuantity')} 
                disabled
                className="bg-gray-50"
              />
            </div>
            <div>
              <Text className="mb-1">Cant. Física</Text>
              <NumberInput 
                value={watch('physicalQuantity')} 
                onValueChange={(val) => setValue('physicalQuantity', val)}
                min={0}
              />
              {errors.physicalQuantity && (
                <Text className="text-red-500 text-sm mt-1">{errors.physicalQuantity.message}</Text>
              )}
            </div>
          </div>

          <div>
            <Text className="mb-1">Notas / Hallazgos</Text>
            <TextInput 
              placeholder="Ej: Diferencia por merma, error de registro..." 
              {...register('notes')}
            />
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Can action={Action.Create} subject="PhysicalInventory" fallback={
              <Button disabled color="gray">
                Sin permisos
              </Button>
            }>
              <Button 
                loading={createAudit.isPending} 
                icon={ClipboardCheck}
                type="submit"
                color="emerald"
              >
                Registrar Auditoría
              </Button>
            </Can>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
}
