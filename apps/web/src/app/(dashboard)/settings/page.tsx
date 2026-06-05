"use client";

import React from 'react';
import { 
  Title, 
  Text, 
  Card, 
  TabGroup, 
  TabList, 
  Tab, 
  TabPanels, 
  TabPanel,
  TextInput,
  Button,
  Flex,
  Switch,
  Divider,
} from '@tremor/react';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Database,
  Save
} from 'lucide-react';

export default function SettingsPage() {
  return (
    <main className="p-4 sm:p-6 lg:p-10">
      <Title className="text-2xl font-bold">Configuración</Title>
      <Text className="text-gray-500">Ajustes generales del sistema y preferencias de usuario.</Text>

      <TabGroup className="mt-8">
        <TabList className="overflow-x-auto">
          <Tab icon={User}>Perfil</Tab>
          <Tab icon={Bell}>Notificaciones</Tab>
          <Tab icon={Shield}>Seguridad</Tab>
          <Tab icon={Database}>Sistema</Tab>
        </TabList>
        <TabPanels>
          {/* Perfil */}
          <TabPanel>
            <Card className="mt-6 max-w-2xl">
              <Title>Información Personal</Title>
              <div className="mt-6 space-y-4">
                <div>
                  <Text className="mb-1">Nombre Completo</Text>
                  <TextInput placeholder="Admin BI Logístico" />
                </div>
                <div>
                  <Text className="mb-1">Correo Electrónico</Text>
                  <TextInput placeholder="admin@logistics.com" disabled />
                </div>
                <div>
                  <Text className="mb-1">Cargo</Text>
                  <TextInput placeholder="Director de Operaciones" />
                </div>
                <Button icon={Save} className="mt-4">Guardar Cambios</Button>
              </div>
            </Card>
          </TabPanel>
          
          {/* Notificaciones */}
          <TabPanel>
            <Card className="mt-6 max-w-2xl">
              <Title>Preferencias de Alerta</Title>
              <div className="mt-6 space-y-6">
                <Flex justifyContent="between">
                  <div>
                    <Text className="font-medium">Alertas de KPIs Críticos</Text>
                    <Text className="text-xs text-gray-400">Recibir avisos cuando un KPI esté en zona roja.</Text>
                  </div>
                  <Switch defaultChecked />
                </Flex>
                <Divider />
                <Flex justifyContent="between">
                  <div>
                    <Text className="font-medium">Reportes Semanales</Text>
                    <Text className="text-xs text-gray-400">Envío automático del resumen ejecutivo los lunes.</Text>
                  </div>
                  <Switch defaultChecked />
                </Flex>
                <Divider />
                <Flex justifyContent="between">
                  <div>
                    <Text className="font-medium">Aprobaciones Pendientes</Text>
                    <Text className="text-xs text-gray-400">Notificar nuevas órdenes de compra por autorizar.</Text>
                  </div>
                  <Switch />
                </Flex>
              </div>
            </Card>
          </TabPanel>

          {/* Seguridad */}
          <TabPanel>
            <Card className="mt-6 max-w-2xl">
              <Title>Seguridad de la Cuenta</Title>
              <div className="mt-6 space-y-4">
                <Button variant="secondary" color="gray">Cambiar Contraseña</Button>
                <Divider />
                <Text className="font-medium">Autenticación de Dos Factores (2FA)</Text>
                <Text className="text-sm text-gray-500 mb-4">Añade una capa extra de seguridad a tu cuenta.</Text>
                <Button variant="secondary">Configurar 2FA</Button>
              </div>
            </Card>
          </TabPanel>

          {/* Sistema */}
          <TabPanel>
             <Card className="mt-6 max-w-2xl">
              <Title>Parámetros del Sistema</Title>
              <div className="mt-6 space-y-4">
                <Text className="text-sm text-gray-500">Versión del BI: 1.2.0-stable</Text>
                <Text className="text-sm text-gray-500">Base de Datos: PostgreSQL (Local)</Text>
                <Button variant="light" color="red">Limpiar Caché del Sistema</Button>
              </div>
            </Card>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </main>
  );
}
