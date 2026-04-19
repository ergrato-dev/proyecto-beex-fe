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
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // ¿Qué? Cierra la sesión del usuario y lo redirige al login.
  // ¿Para qué? Limpiar los tokens del localStorage y el estado del contexto,
  //   dejando la app en estado no-autenticado antes de la redirección.
  // ¿Impacto? Sin navigate('/login'), el usuario vería el dashboard vacío
  //   (sin user) hasta que ProtectedRoute lo redirijera automáticamente.
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ¿Qué? Formato de fecha según el idioma activo del usuario.
  // ¿Para qué? Un usuario en EN esperaría "January 1, 2025" mientras que en ES "1 de enero de 2025".
  const formatDate = (dateStr: string): string =>
    new Date(dateStr).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* ─── Bienvenida ─── */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-1">
          {t('dashboard.welcome', { name: user?.fullName })}
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          {t('dashboard.sessionActive')}
        </p>
      </div>

      {/* ─── Tarjeta de perfil ─── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 mb-6 max-w-md">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-4">
          {t('dashboard.accountData')}
        </h2>
        <dl className="space-y-3">
          <div>
            <dt className="text-xs text-gray-500 dark:text-slate-400">{t('dashboard.nameLabel')}</dt>
            <dd className="text-sm text-gray-900 dark:text-slate-100 font-medium">
              {user?.fullName}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500 dark:text-slate-400">
              {t('dashboard.emailLabel')}
            </dt>
            <dd className="text-sm text-gray-900 dark:text-slate-100 font-medium">
              {user?.email}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500 dark:text-slate-400">
              {t('dashboard.memberSince')}
            </dt>
            <dd className="text-sm text-gray-900 dark:text-slate-100 font-medium">
              {user?.createdAt ? formatDate(user.createdAt) : '—'}
            </dd>
          </div>
        </dl>
      </div>

      {/* ─── Acciones — alineadas a la derecha conforme al design system ─── */}
      <div className="flex flex-wrap justify-end gap-3 max-w-md">
        <Link to="/change-password">
          <Button variant="secondary">
            <KeyRound className="h-4 w-4" aria-hidden="true" />
            {t('dashboard.changePasswordButton')}
          </Button>
        </Link>
        <Button variant="danger" onClick={handleLogout}>
          <LogOut className="h-4 w-4" aria-hidden="true" />
          {t('dashboard.logoutButton')}
        </Button>
      </div>
    </div>
  );
}
