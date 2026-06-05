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
} from '@tremor/react';
import { ClipboardCheck, X } from 'lucide-react';
import { trpc } from '@/lib/trpc/react';

interface AuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuditModal({ isOpen, onClose, onSuccess }: AuditModalProps) {
  const [formData, setFormData] = useState({
    productId: '',
    warehouseId: '',
    systemQuantity: 0,
    physicalQuantity: 0,
    notes: '',
  });

  const { data: products } = trpc.inventory.getProducts.useQuery();
  const { data: warehouses } = trpc.inventory.getWarehouses.useQuery();

  // Autocompletar warehouseId
  React.useEffect(() => {
    if (warehouses && warehouses.length > 0 && !formData.warehouseId) {
      setFormData(prev => ({ ...prev, warehouseId: warehouses[0].id }));
    }
  }, [warehouses, formData.warehouseId]);

  // Actualizar cantidad del sistema cuando cambia el producto
  React.useEffect(() => {
    if (formData.productId && products) {
      const product = products.find(p => p.id === formData.productId);
      if (product) {
        setFormData(prev => ({ ...prev, systemQuantity: product.currentStock }));
      }
    }
  }, [formData.productId, products]);

  const createAudit = trpc.inventory.createPhysicalInventory.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
      setFormData({
        productId: '',
        warehouseId: warehouses?.[0]?.id || '',
        systemQuantity: 0,
        physicalQuantity: 0,
        notes: '',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId || !formData.warehouseId) return;

    createAudit.mutate({
      ...formData,
      countedById: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', // Mock user ID for now
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} static={true}>
      <DialogPanel className="max-w-md">
        <Flex justifyContent="between" alignItems="center">
          <Title>Auditoría de Inventario</Title>
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
                  {p.name} (Stock: {p.currentStock})
                </SelectItem>
              ))}
            </Select>
          </div>

          <div>
            <Text className="mb-1">Bodega</Text>
            <Select 
              value={formData.warehouseId} 
              onValueChange={(val) => setFormData({ ...formData, warehouseId: val })}
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
              <Text className="mb-1">Cant. Sistema</Text>
              <NumberInput 
                value={formData.systemQuantity} 
                disabled
                className="bg-gray-50"
              />
            </div>
            <div>
              <Text className="mb-1">Cant. Física</Text>
              <NumberInput 
                value={formData.physicalQuantity} 
                onValueChange={(val) => setFormData({ ...formData, physicalQuantity: val })}
                min={0}
              />
            </div>
          </div>

          <div>
            <Text className="mb-1">Notas / Hallazgos</Text>
            <TextInput 
              placeholder="Ej: Diferencia por merma, error de registro..." 
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              loading={createAudit.isPending} 
              icon={ClipboardCheck}
              type="submit"
              color="emerald"
            >
              Registrar Auditoría
            </Button>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
}
