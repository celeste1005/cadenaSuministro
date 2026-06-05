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
import { Globe, X, DollarSign, Package, Ship, Anchor } from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import { es } from 'date-fns/locale';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportExportModal({ isOpen, onClose, onSuccess }: ImportExportModalProps) {
  const [formData, setFormData] = useState({
    operationType: 'IMPORT' as 'IMPORT' | 'EXPORT',
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
  });

  const { data: products } = trpc.inventory.getProducts.useQuery();
  const { data: suppliers } = trpc.purchasing.getSuppliers.useQuery();

  const createOperation = trpc.internationalTrade.createOperation.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
      setFormData({
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
      });
    },
  });

  // Calcular costo total automáticamente
  React.useEffect(() => {
    const total = (formData.quantity * formData.unitCostUsd) + 
                  (formData.freightCostUsd || 0) + 
                  (formData.insuranceCostUsd || 0) + 
                  (formData.customsDutiesUsd || 0);
    setFormData(prev => ({ ...prev, totalCostUsd: total }));
  }, [formData.quantity, formData.unitCostUsd, formData.freightCostUsd, formData.insuranceCostUsd, formData.customsDutiesUsd]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId || formData.quantity <= 0) return;
    
    createOperation.mutate({
      ...formData,
      supplierId: formData.operationType === 'IMPORT' ? formData.supplierId : undefined,
      customerName: formData.operationType === 'EXPORT' ? formData.customerName : undefined,
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} static={true}>
      <DialogPanel className="max-w-2xl">
        <Flex justifyContent="between" alignItems="center">
          <Title>{formData.operationType === 'IMPORT' ? 'Registrar Importación' : 'Registrar Exportación'}</Title>
          <Button variant="light" icon={X} onClick={onClose} />
        </Flex>
        
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text className="mb-1">Tipo de Operación</Text>
              <Select 
                value={formData.operationType} 
                onValueChange={(val: any) => setFormData({ ...formData, operationType: val })}
              >
                <SelectItem value="IMPORT">Importación</SelectItem>
                <SelectItem value="EXPORT">Exportación</SelectItem>
              </Select>
            </div>
            <div>
              <Text className="mb-1">Fecha</Text>
              <DatePicker
                value={formData.operationDate}
                onValueChange={(val) => val && setFormData({ ...formData, operationDate: val })}
                locale={es}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            {formData.operationType === 'IMPORT' ? (
              <div>
                <Text className="mb-1">Proveedor Extranjero</Text>
                <Select 
                  value={formData.supplierId} 
                  onValueChange={(val) => setFormData({ ...formData, supplierId: val })}
                  placeholder="Seleccionar proveedor..."
                >
                  {suppliers?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            ) : (
              <div>
                <Text className="mb-1">Cliente Internacional</Text>
                <TextInput 
                  placeholder="Nombre del cliente..." 
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                />
              </div>
            )}
          </div>

          <Divider>Costos y Cantidades (USD)</Divider>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Text className="mb-1">Cantidad</Text>
              <NumberInput 
                value={formData.quantity} 
                onValueChange={(val) => setFormData({ ...formData, quantity: val })}
                min={1}
              />
            </div>
            <div>
              <Text className="mb-1">Costo Unitario</Text>
              <NumberInput 
                value={formData.unitCostUsd} 
                onValueChange={(val) => setFormData({ ...formData, unitCostUsd: val })}
                min={0}
                icon={DollarSign}
              />
            </div>
            <div>
              <Text className="mb-1">Flete</Text>
              <NumberInput 
                value={formData.freightCostUsd} 
                onValueChange={(val) => setFormData({ ...formData, freightCostUsd: val })}
                min={0}
                icon={Ship}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Text className="mb-1">Seguro</Text>
              <NumberInput 
                value={formData.insuranceCostUsd} 
                onValueChange={(val) => setFormData({ ...formData, insuranceCostUsd: val })}
                min={0}
              />
            </div>
            <div>
              <Text className="mb-1">Aranceles</Text>
              <NumberInput 
                value={formData.customsDutiesUsd} 
                onValueChange={(val) => setFormData({ ...formData, customsDutiesUsd: val })}
                min={0}
              />
            </div>
            <div>
              <Text className="mb-1 font-bold">Costo Total DDP</Text>
              <div className="p-2 bg-gray-100 rounded text-center font-bold text-gray-900">
                ${formData.totalCostUsd.toLocaleString()}
              </div>
            </div>
          </div>

          <Divider>Logística Internacional</Divider>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text className="mb-1">Puerto Origen</Text>
              <TextInput 
                placeholder="Ej: Shanghai, China" 
                value={formData.portOfOrigin}
                onChange={(e) => setFormData({ ...formData, portOfOrigin: e.target.value })}
                icon={Anchor}
              />
            </div>
            <div>
              <Text className="mb-1">Puerto Destino</Text>
              <TextInput 
                placeholder="Ej: Buenaventura, Colombia" 
                value={formData.portOfDestination}
                onChange={(e) => setFormData({ ...formData, portOfDestination: e.target.value })}
                icon={Anchor}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text className="mb-1">Contenedor / BL</Text>
              <TextInput 
                placeholder="Nº Contenedor o Bill of Lading" 
                value={formData.containerNumber || formData.blNumber}
                onChange={(e) => setFormData({ ...formData, containerNumber: e.target.value, blNumber: e.target.value })}
              />
            </div>
            <div>
              <Text className="mb-1">Estado</Text>
              <Select 
                value={formData.status} 
                onValueChange={(val) => setFormData({ ...formData, status: val })}
              >
                <SelectItem value="IN_TRANSIT">En Tránsito</SelectItem>
                <SelectItem value="PORT_OF_ORIGIN">En Puerto Origen</SelectItem>
                <SelectItem value="CUSTOMS">En Aduana</SelectItem>
                <SelectItem value="DELIVERED">Entregado</SelectItem>
              </Select>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              loading={createOperation.isPending} 
              icon={Globe}
              type="submit"
              color="cyan"
            >
              Confirmar Operación
            </Button>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
}
