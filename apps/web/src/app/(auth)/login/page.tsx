'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../../components/providers/auth-provider';

const loginSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'El email es obligatorio'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@demo.local',
      password: 'demo123',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    setSubmitting(true);
    try {
      await login(data.email.trim(), data.password);
      const from = searchParams.get('from') || '/dashboard';
      window.location.assign(from);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Iniciar Sesión</h2>
        <p className="mt-2 text-sm text-gray-600">BI Logístico - ProyectoCD</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        {error && (
          <div
            role="alert"
            className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className={`mt-1 block w-full border ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm p-2 text-gray-900`}
            placeholder="admin@demo.local"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className={`mt-1 block w-full border ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm p-2 text-gray-900`}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Demo: admin@demo.local / demo123
      </p>

      <p className="text-center text-xs text-gray-400">
        Requiere API en ejecución (puerto 4000). Usa{' '}
        <code className="bg-gray-100 px-1 rounded">pnpm dev</code> en la raíz del proyecto.
      </p>

      <div className="text-center text-sm">
        <Link href="/register" className="text-blue-600 hover:text-blue-500">
          ¿No tienes cuenta? Regístrate
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center text-gray-500 py-8">Cargando…</div>}>
      <LoginForm />
    </Suspense>
  );
}
