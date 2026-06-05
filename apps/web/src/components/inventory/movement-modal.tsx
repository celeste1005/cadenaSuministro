'use client';

import React, { useState } from 'react';
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

interface MovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function MovementModal({ isOpen, onClose, onSuccess }: MovementModalProps) {
  const [formData, setFormData] = useState({
    productId: '',
    warehouseId: '', 
    type: 'IN' as 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER',
    quantity: 0,
    reference: '',
    notes: '',
  });

  const { data: products } = trpc.inventory.getProducts.useQuery();
  const { data: warehouses } = trpc.inventory.getWarehouses.useQuery();
  
  // Update warehouseId once warehouses are loaded
  React.useEffect(() => {
    if (warehouses && warehouses.length > 0 && !formData.warehouseId) {
      setFormData(prev => ({ ...prev, warehouseId: warehouses[0].id }));
    }
  }, [warehouses, formData.warehouseId]);

  const createMovement = trpc.inventory.createMovement.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
      setFormData({
        productId: '',
        warehouseId: '8097d848-3563-4702-8924-d2e5352f2059',
        type: 'IN',
        quantity: 0,
        reference: '',
        notes: '',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId || formData.quantity <= 0) return;
    
    createMovement.mutate({
      ...formData,
      quantity: Number(formData.quantity),
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} static={true}>
      <DialogPanel className="max-w-md">
        <Flex justifyContent="between" alignItems="center">
          <Title>Registrar Movimiento</Title>
          <Button variant="light" icon={X} onClick={onClose} />
        </Flex>
        
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Text className="mb-1">Producto</Text>
            <Select 
              value={formData.productId} 
              onValueChange={(val) => setFormData({ ...formData, productId: val })}
              placeholder="Seleccionar producto..."
            >
              {products?.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </Select>
          </div>

          <div>
            <Text className="mb-1">Bodega</Text>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text className="mb-1">Tipo</Text>
              <Select 
                value={formData.type} 
                onValueChange={(val: any) => setFormData({ ...formData, type: val })}
              >
                <SelectItem value="IN">Entrada (+)</SelectItem>
                <SelectItem value="OUT">Salida (-)</SelectItem>
                <SelectItem value="ADJUSTMENT">Ajuste</SelectItem>
                <SelectItem value="TRANSFER">Traslado</SelectItem>
              </Select>
            </div>
            <div>
              <Text className="mb-1">Cantidad</Text>
              <NumberInput 
                value={formData.quantity} 
                onValueChange={(val) => setFormData({ ...formData, quantity: val })}
                min={1}
              />
            </div>
          </div>

          <div>
            <Text className="mb-1">Referencia / Documento</Text>
            <TextInput 
              placeholder="Ej: OC-123, Factura 45..." 
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
            />
          </div>

          <div>
            <Text className="mb-1">Notas</Text>
            <TextInput 
              placeholder="Observaciones adicionales" 
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              loading={createMovement.isPending} 
              icon={PlusCircle}
              type="submit"
            >
              Confirmar
            </Button>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
}
