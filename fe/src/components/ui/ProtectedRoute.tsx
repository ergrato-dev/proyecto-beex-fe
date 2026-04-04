/**
 * Archivo: components/ui/ProtectedRoute.tsx
 * Descripción: Componente que protege rutas que requieren autenticación.
 * ¿Para qué? Redirigir al login si el usuario no está autenticado antes de
 *   mostrar páginas que requieren sesión activa (Dashboard, ChangePassword, etc.).
 * ¿Impacto? Sin este componente cualquier usuario podría navegar a rutas privadas
 *   directamente desde la URL del navegador.
 */

import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

// ¿Qué? Wrapper de ruta que verifica autenticación antes de renderizar el hijo.
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();

  // ¿Qué? Mientras se verifica la sesión (token en localStorage), no redirigir aún.
  // ¿Para qué? Evitar un flash de redirección al login cuando el usuario ya tiene sesión.
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="text-gray-500 dark:text-gray-400 text-sm">{t('common.loading')}</p>
      </div>
    );
  }

  // ¿Qué? Si no está autenticado, redirigir al login con replace para no dejar historial.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
