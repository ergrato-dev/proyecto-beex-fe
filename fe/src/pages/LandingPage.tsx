/**
 * Archivo: pages/LandingPage.tsx
 * Descripción: Página pública de inicio — presentación del sistema NN Auth.
 * ¿Para qué? Primera impresión del sistema para usuarios no autenticados:
 *   explica qué es y dirige al registro o al login.
 * ¿Impacto? Es el punto de entrada principal de la aplicación.
 */

import { Link } from 'react-router-dom';
import { Shield, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// ¿Qué? Datos de las características del sistema para renderizar la sección de features.
const FEATURES = [
  {
    icon: Shield,
    title: 'Autenticación segura',
    description: 'JWT con access tokens de 15 minutos y refresh tokens de 7 días.',
  },
  {
    icon: Lock,
    title: 'Contraseñas protegidas',
    description: 'Hashing con bcrypt — nunca almacenamos contraseñas en texto plano.',
  },
  {
    icon: Mail,
    title: 'Recuperación por email',
    description: 'Restablece tu contraseña de forma segura desde tu correo electrónico.',
  },
];

export function LandingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      {/* ─── Hero ─── */}
      <section className="text-center mb-20">
        <h1 className="text-4xl sm:text-5xl font-semibold text-gray-900 dark:text-gray-100 mb-4 tracking-tight">
          NN Auth System
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-8">
          Sistema de autenticación completo — registro, login, cambio y recuperación
          de contraseña. Seguro por defecto.
        </p>

        {/* ¿Qué? Botones de acción alineados al centro en el hero (excepción justificada: CTA principal). */}
        <div className="flex items-center justify-center gap-3">
          <Link to="/register">
            <Button variant="primary">Crear cuenta</Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary">Iniciar sesión</Button>
          </Link>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section aria-labelledby="features-heading">
        <h2
          id="features-heading"
          className="text-base font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center mb-10"
        >
          Características
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
            >
              <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-3" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
