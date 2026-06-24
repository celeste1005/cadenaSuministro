'use client';

import React, { useState } from 'react';
import { Button } from '@tremor/react';
import { Download, Loader2 } from 'lucide-react';
import { getApiBaseUrl } from '../../lib/auth/config';

interface ExportButtonProps {
  endpoint: string;
  filename?: string;
  label?: string;
  variant?: 'primary' | 'secondary' | 'light';
  className?: string;
}

export function ExportButton({
  endpoint,
  filename = 'reporte.pdf',
  label = 'Descargar PDF',
  variant = 'primary',
  className = '',
}: ExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}${endpoint}`, { credentials: 'include' });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Error al generar el reporte' }));
        throw new Error(err.message);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      alert(err instanceof Error ? err.message : 'Error al descargar el reporte');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      icon={isLoading ? Loader2 : Download}
      variant={variant}
      size="sm"
      className={className}
      disabled={isLoading}
      onClick={handleDownload}
    >
      {isLoading ? 'Generando...' : label}
    </Button>
  );
}
