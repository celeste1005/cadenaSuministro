'use client';

import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  Dialog,
  DialogPanel,
  Select,
  SelectItem,
  NumberInput,
  TextInput,
  DatePicker,
  Title,
  Text,
  Flex,
} from '@tremor/react';
import { ShoppingCart, X, Plus, Trash2 } from 'lucide-react';
import { Can, Action } from '@/components/auth/can';
import { useAuth } from '@/components/providers/auth-provider';
import { trpc } from '@/lib/trpc/react';

const purchaseOrderLineSchema = z.object({
  productId: z.string().uuid('Producto inválido'),
  quantity: z.number().min(1, 'Cantidad debe ser al menos 1'),
  unitPrice: z.number().min(0, 'Precio unitario debe ser positivo'),
});

const purchaseOrderSchema = z.object({
  supplierId: z.string().uuid('Proveedor inválido'),
  poNumber: z.string().min(1, 'Número de orden es requerido'),
  orderDate: z.date({
    required_error: 'Fecha de orden es requerida',
  }),
  expectedDeliveryDate: z.date({
    required_error: 'Fecha de entrega esperada es requerida',
  }),
  totalAmount: z.number().min(0, 'Monto total debe ser positivo'),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED']),
  notes: z.string().optional(),
  lines: z.array(purchaseOrderLineSchema).min(1, 'Debe agregar al menos un producto'),
});

type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;

interface PurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'APPROVED', label: 'Aprobado' },
  { value: 'REJECTED', label: 'Rechazado' },
  { value: 'COMPLETED', label: 'Completado' },
];

export function PurchaseOrderModal({ isOpen, onClose, onSuccess }: PurchaseOrderModalProps) {
  const { can } = useAuth();
  const utils = trpc.useUtils();

  const {
    register,
    handleSubmit: handleFormSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
    control,
  } = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      supplierId: '',
      poNumber: '',
      orderDate: new Date(),
      expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      totalAmount: 0,
      status: 'PENDING',
      notes: '',
      lines: [{ productId: '', quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lines',
  });

  const { data: suppliers } = trpc.purchasing.getSuppliers.useQuery();
  const { data: products } = trpc.inventory.getProducts.useQuery();

  const createPurchaseOrder = trpc.purchasing.createPurchaseOrder.useMutation({
    onSuccess: () => {
      utils.purchasing.getPurchaseOrders.invalidate();
      onSuccess();
      onClose();
      reset();
    },
  });

  const onSubmit = (data: PurchaseOrderFormData) => {
    createPurchaseOrder.mutate(data);
  };

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  return (
    <Dialog open={isOpen} onClose={onClose} static={true} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <DialogPanel className="relative z-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-kpi shadow-kpi p-6">
        <Flex justifyContent="between" alignItems="center">
          <Title className="text-xl font-bold text-gray-900">Nueva Orden de Compra</Title>
          <Button variant="light" icon={X} onClick={onClose} className="hover:bg-gray-100" />
        </Flex>

        <form onSubmit={handleFormSubmit(onSubmit)} className="mt-6 space-y-5">
          <div>
            <Text className="mb-2 text-sm font-bold text-gray-700">Proveedor</Text>
            <Select
              value={watch('supplierId')}
              onValueChange={(val) => setValue('supplierId', val)}
              placeholder="Seleccionar proveedor..."
              className="rounded-lg"
            >
              {suppliers?.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </Select>
            {errors.supplierId && (
              <Text className="text-red-500 text-sm mt-1 font-medium">{errors.supplierId.message}</Text>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text className="mb-2 text-sm font-bold text-gray-700">Número de Orden</Text>
              <TextInput
                {...register('poNumber')}
                placeholder="PO-XXXXX"
                className="rounded-lg"
              />
              {errors.poNumber && (
                <Text className="text-red-500 text-sm mt-1 font-medium">{errors.poNumber.message}</Text>
              )}
            </div>
            <div>
              <Text className="mb-2 text-sm font-bold text-gray-700">Estado</Text>
              <Select
                value={watch('status')}
                onValueChange={(val) => setValue('status', val as any)}
                className="rounded-lg"
              >
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
              {errors.status && (
                <Text className="text-red-500 text-sm mt-1 font-medium">{errors.status.message}</Text>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text className="mb-2 text-sm font-bold text-gray-700">Fecha de Orden</Text>
              <DatePicker
                value={watch('orderDate')}
                onValueChange={(val) => val && setValue('orderDate', val)}
                className="rounded-lg"
              />
              {errors.orderDate && (
                <Text className="text-red-500 text-sm mt-1 font-medium">{errors.orderDate.message}</Text>
              )}
            </div>
            <div>
              <Text className="mb-2 text-sm font-bold text-gray-700">Fecha de Entrega Esperada</Text>
              <DatePicker
                value={watch('expectedDeliveryDate')}
                onValueChange={(val) => val && setValue('expectedDeliveryDate', val)}
                className="rounded-lg"
              />
              {errors.expectedDeliveryDate && (
                <Text className="text-red-500 text-sm mt-1 font-medium">{errors.expectedDeliveryDate.message}</Text>
              )}
            </div>
          </div>

          <div>
            <Flex justifyContent="between" alignItems="center" className="mb-2">
              <Text className="font-bold">Líneas de Producto</Text>
              <Button
                type="button"
                variant="light"
                size="xs"
                icon={Plus}
                onClick={() => append({ productId: '', quantity: 1, unitPrice: 0 })}
              >
                Agregar Producto
              </Button>
            </Flex>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg bg-gray-50">
                  <div className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-5">
                      <Text className="mb-1 text-xs">Producto</Text>
                      <Select
                        value={watch(`lines.${index}.productId`)}
                        onValueChange={(val) => setValue(`lines.${index}.productId`, val)}
                        placeholder="Seleccionar producto..."
                      >
                        {products?.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </Select>
                      {errors.lines?.[index]?.productId && (
                        <Text className="text-red-500 text-xs mt-1">{errors.lines[index]?.productId?.message}</Text>
                      )}
                    </div>
                    <div className="col-span-2">
                      <Text className="mb-1 text-xs">Cantidad</Text>
                      <NumberInput
                        value={watch(`lines.${index}.quantity`)}
                        onValueChange={(val) => setValue(`lines.${index}.quantity`, val)}
                        min={1}
                      />
                      {errors.lines?.[index]?.quantity && (
                        <Text className="text-red-500 text-xs mt-1">{errors.lines[index]?.quantity?.message}</Text>
                      )}
                    </div>
                    <div className="col-span-3">
                      <Text className="mb-1 text-xs">Precio Unitario</Text>
                      <NumberInput
                        value={watch(`lines.${index}.unitPrice`)}
                        onValueChange={(val) => setValue(`lines.${index}.unitPrice`, val)}
                        min={0}
                      />
                      {errors.lines?.[index]?.unitPrice && (
                        <Text className="text-red-500 text-xs mt-1">{errors.lines[index]?.unitPrice?.message}</Text>
                      )}
                    </div>
                    <div className="col-span-2">
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="light"
                          size="xs"
                          icon={Trash2}
                          onClick={() => remove(index)}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {errors.lines && (
              <Text className="text-red-500 text-sm mt-1">{errors.lines.message}</Text>
            )}
          </div>

          <div>
            <Text className="mb-2 text-sm font-bold text-gray-700">Notas</Text>
            <TextInput
              {...register('notes')}
              placeholder="Notas adicionales..."
              className="rounded-lg"
            />
            {errors.notes && (
              <Text className="text-red-500 text-sm mt-1 font-medium">{errors.notes.message}</Text>
            )}
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <Button variant="secondary" onClick={onClose} className="rounded-lg">
              Cancelar
            </Button>
            <Can action={Action.Create} subject="PurchaseOrder" fallback={
              <Button disabled color="gray" className="rounded-lg">
                Sin permisos
              </Button>
            }>
              <Button
                loading={createPurchaseOrder.isPending}
                icon={ShoppingCart}
                type="submit"
                color="blue"
                className="rounded-lg"
              >
                Crear Orden
              </Button>
            </Can>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
}
