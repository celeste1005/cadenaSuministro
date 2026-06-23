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
import { Truck, X, Plus, Trash2 } from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import { Can, Action } from '@/components/auth/can';
import { useAuth } from '@/components/providers/auth-provider';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { dispatchSchema, type DispatchFormData } from '@/lib/validations/schemas';

interface DispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DispatchModal({ isOpen, onClose, onSuccess }: DispatchModalProps) {
  const { can } = useAuth();
  const { data: customers } = trpc.customerService.getCustomers.useQuery();
  const { data: products } = trpc.inventory.getProducts.useQuery();

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    control,
  } = useForm<DispatchFormData>({
    resolver: zodResolver(dispatchSchema),
    defaultValues: {
      customerId: '',
      orderReference: '',
      dispatchDate: new Date(),
      promisedDate: new Date(),
      lines: [{ productId: '', quantityRequested: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lines',
  });

  const createDispatch = trpc.customerService.createDispatch.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
      reset({
        customerId: '',
        orderReference: '',
        dispatchDate: new Date(),
        promisedDate: new Date(),
        lines: [{ productId: '', quantityRequested: 1 }],
      });
    },
  });

  const onSubmit = (data: DispatchFormData) => {
    createDispatch.mutate(data);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} static={true} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <DialogPanel className="relative z-10 max-w-xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-kpi shadow-kpi p-6">
        <Flex justifyContent="between" alignItems="center">
          <Title className="text-xl font-bold text-gray-900">Nuevo Despacho</Title>
          <Button variant="light" icon={X} onClick={onClose} className="hover:bg-gray-100" />
        </Flex>
        
        <form onSubmit={handleFormSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text className="mb-1">Cliente</Text>
              <Select 
                value={watch('customerId')} 
                onValueChange={(val) => setValue('customerId', val)}
                placeholder="Seleccionar cliente..."
              >
                {customers?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </Select>
              {errors.customerId && (
                <Text className="text-red-500 text-sm mt-1">{errors.customerId.message}</Text>
              )}
            </div>
            <div>
              <Text className="mb-1">Ref. Pedido</Text>
              <TextInput 
                placeholder="Ej: PED-2024-001" 
                {...register('orderReference')}
              />
              {errors.orderReference && (
                <Text className="text-red-500 text-sm mt-1">{errors.orderReference.message}</Text>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text className="mb-1">Fecha Despacho</Text>
              <DatePicker
                value={watch('dispatchDate')}
                onValueChange={(val) => val && setValue('dispatchDate', val)}
              />
              {errors.dispatchDate && (
                <Text className="text-red-500 text-sm mt-1">{errors.dispatchDate.message}</Text>
              )}
            </div>
            <div>
              <Text className="mb-1">Fecha Prometida</Text>
              <DatePicker
                value={watch('promisedDate')}
                onValueChange={(val) => val && setValue('promisedDate', val)}
              />
              {errors.promisedDate && (
                <Text className="text-red-500 text-sm mt-1">{errors.promisedDate.message}</Text>
              )}
            </div>
          </div>

          <Divider>Productos</Divider>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-end space-x-2">
                <div className="flex-1">
                  <Text className="text-xs mb-1">Producto</Text>
                  <Select 
                    value={watch(`lines.${index}.productId`)} 
                    onValueChange={(val) => setValue(`lines.${index}.productId`, val)}
                    placeholder="Producto..."
                  >
                    {products?.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </Select>
                  {errors.lines?.[index]?.productId && (
                    <Text className="text-red-500 text-xs mt-1">{errors.lines[index]?.productId?.message}</Text>
                  )}
                </div>
                <div className="w-24">
                  <Text className="text-xs mb-1">Cant.</Text>
                  <NumberInput 
                    value={watch(`lines.${index}.quantityRequested`)} 
                    onValueChange={(val) => setValue(`lines.${index}.quantityRequested`, val)}
                    min={1}
                  />
                  {errors.lines?.[index]?.quantityRequested && (
                    <Text className="text-red-500 text-xs mt-1">{errors.lines[index]?.quantityRequested?.message}</Text>
                  )}
                </div>
                <Button 
                  icon={Trash2} 
                  variant="light" 
                  color="red" 
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                />
              </div>
            ))}
          </div>

          <Button 
            type="button" 
            variant="light" 
            icon={Plus} 
            onClick={() => append({ productId: '', quantityRequested: 1 })}
            className="mt-2"
          >
            Agregar Producto
          </Button>

          {errors.lines && (
            <Text className="text-red-500 text-sm">{errors.lines.message}</Text>
          )}

          <div className="mt-8 flex justify-end space-x-3">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Can action={Action.Create} subject="Dispatch" fallback={
              <Button disabled color="gray">
                Sin permisos
              </Button>
            }>
              <Button 
                loading={createDispatch.isPending} 
                icon={Truck}
                type="submit"
                color="emerald"
              >
                Crear Despacho
              </Button>
            </Can>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
}
