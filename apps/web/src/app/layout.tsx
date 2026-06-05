import React from 'react';
import { Providers } from '../components/providers/trpc-provider';
import '../styles/globals.css';

export const metadata = {
  title: 'BI Logístico - ProyectoCD',
  description: 'Panel de control de indicadores logísticos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
