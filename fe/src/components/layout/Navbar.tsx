/**
 * Archivo: components/layout/Navbar.tsx
 * Descripción: Barra de navegación principal de la aplicación.
 * ¿Para qué? Proveer navegación consistente y acceso al toggle de tema en todas las páginas.
 * ¿Impacto? Centralizar la navbar aquí evita duplicar código en cada página.
 */

import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <nav
        className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between"
        aria-label="Navegación principal"
      >
        {/* ¿Qué? Logo / nombre del sistema — enlace a la raíz. */}
        <Link
          to="/"
          className="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
        >
          NN Auth
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {isAuthenticated ? (
            <>
              {/* ¿Qué? Enlace al perfil del usuario autenticado. */}
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
              >
                <User className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{user?.fullName}</span>
              </Link>

              {/* ¿Qué? Botón de logout accesible con aria-label. */}
              <button
                onClick={handleLogout}
                aria-label="Cerrar sesión"
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors duration-200"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
