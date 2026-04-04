/**
 * Archivo: pages/DashboardPage.tsx
 * Descripción: Página principal del usuario autenticado — muestra su perfil.
 * ¿Para qué? Punto de llegada tras el login — confirma que la autenticación
 *   funcionó y da acceso a las acciones protegidas del sistema.
 * ¿Impacto? Es la primera pantalla que ve el usuario autenticado; debe
 *   transmitir seguridad y claridad sobre su estado de sesión.
 */

import { Link } from 'react-router-dom';
import { KeyRound, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* ─── Bienvenida ─── */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Bienvenido, {user?.fullName}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Tu sesión está activa.
        </p>
      </div>

      {/* ─── Tarjeta de perfil ─── */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6 max-w-md">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">
          Datos de la cuenta
        </h2>
        <dl className="space-y-3">
          <div>
            <dt className="text-xs text-gray-500 dark:text-gray-400">Nombre</dt>
            <dd className="text-sm text-gray-900 dark:text-gray-100 font-medium">
              {user?.fullName}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500 dark:text-gray-400">
              Correo electrónico
            </dt>
            <dd className="text-sm text-gray-900 dark:text-gray-100 font-medium">
              {user?.email}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500 dark:text-gray-400">
              Miembro desde
            </dt>
            <dd className="text-sm text-gray-900 dark:text-gray-100 font-medium">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : '—'}
            </dd>
          </div>
        </dl>
      </div>

      {/* ─── Acciones — alineadas a la derecha conforme al design system ─── */}
      <div className="flex flex-wrap justify-end gap-3 max-w-md">
        <Link to="/change-password">
          <Button variant="secondary">
            <KeyRound className="h-4 w-4" aria-hidden="true" />
            Cambiar contraseña
          </Button>
        </Link>
        <Button variant="danger" onClick={handleLogout}>
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
