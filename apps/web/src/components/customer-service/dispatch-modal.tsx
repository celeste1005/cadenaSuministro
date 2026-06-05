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
  Divider,
} from '@tremor/react';
import { Truck, X, Plus, Trash2 } from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import { es } from 'date-fns/locale';

interface DispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DispatchModal({ isOpen, onClose, onSuccess }: DispatchModalProps) {
  const [formData, setFormData] = useState({
    customerId: '',
    orderReference: '',
    dispatchDate: new Date(),
    promisedDate: new Date(),
    lines: [{ productId: '', quantityRequested: 1 }],
  });

  const { data: customers } = trpc.customerService.getCustomers.useQuery();
  const { data: products } = trpc.inventory.getProducts.useQuery();

  const createDispatch = trpc.customerService.createDispatch.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
      setFormData({
        customerId: '',
        orderReference: '',
        dispatchDate: new Date(),
        promisedDate: new Date(),
        lines: [{ productId: '', quantityRequested: 1 }],
      });
    },
  });

  const addLine = () => {
    setFormData({
      ...formData,
      lines: [...formData.lines, { productId: '', quantityRequested: 1 }],
    });
  };

  const removeLine = (index: number) => {
    if (formData.lines.length === 1) return;
    const newLines = [...formData.lines];
    newLines.splice(index, 1);
    setFormData({ ...formData, lines: newLines });
  };

  const updateLine = (index: number, field: string, value: any) => {
    const newLines = [...formData.lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setFormData({ ...formData, lines: newLines });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId || !formData.orderReference || formData.lines.some(l => !l.productId)) return;
    createDispatch.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} static={true}>
      <DialogPanel className="max-w-xl">
        <Flex justifyContent="between" alignItems="center">
          <Title>Nuevo Despacho</Title>
          <Button variant="light" icon={X} onClick={onClose} />
        </Flex>
        
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text className="mb-1">Cliente</Text>
              <Select 
                value={formData.customerId} 
                onValueChange={(val) => setFormData({ ...formData, customerId: val })}
                placeholder="Seleccionar cliente..."
              >
                {customers?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </Select>
            </div>
            <div>
              <Text className="mb-1">Ref. Pedido</Text>
              <TextInput 
                placeholder="Ej: PED-2024-001" 
                value={formData.orderReference}
                onChange={(e) => setFormData({ ...formData, orderReference: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text className="mb-1">Fecha Despacho</Text>
              <DatePicker
                value={formData.dispatchDate}
                onValueChange={(val) => val && setFormData({ ...formData, dispatchDate: val })}
                locale={es}
              />
            </div>
            <div>
              <Text className="mb-1">Fecha Prometida</Text>
              <DatePicker
                value={formData.promisedDate}
                onValueChange={(val) => val && setFormData({ ...formData, promisedDate: val })}
                locale={es}
              />
            </div>
          </div>

          <Divider>Productos</Divider>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {formData.lines.map((line, index) => (
              <div key={index} className="flex items-end space-x-2">
                <div className="flex-1">
                  <Text className="text-xs mb-1">Producto</Text>
                  <Select 
                    value={line.productId} 
                    onValueChange={(val) => updateLine(index, 'productId', val)}
                    placeholder="Producto..."
                  >
                    {products?.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="w-24">
                  <Text className="text-xs mb-1">Cant.</Text>
                  <NumberInput 
                    value={line.quantityRequested} 
                    onValueChange={(val) => updateLine(index, 'quantityRequested', val)}
                    min={1}
                  />
                </div>
                <Button 
                  icon={Trash2} 
                  variant="light" 
                  color="red" 
                  onClick={() => removeLine(index)}
                  disabled={formData.lines.length === 1}
                />
              </div>
            ))}
          </div>

          <Button 
            type="button" 
            variant="light" 
            icon={Plus} 
            onClick={addLine}
            className="mt-2"
          >
            Agregar Producto
          </Button>

          <div className="mt-8 flex justify-end space-x-3">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              loading={createDispatch.isPending} 
              icon={Truck}
              type="submit"
              color="emerald"
            >
              Crear Despacho
            </Button>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
}
