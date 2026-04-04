/**
 * Archivo: components/layout/Footer.tsx
 * Descripción: Pie de página con links legales del sistema.
 * ¿Para qué? Proveer acceso a los documentos legales (términos, privacidad, cookies)
 *   y al contacto desde cualquier página de la aplicación.
 * ¿Impacto? Centralizar el footer evita duplicar links legales en cada página.
 */

import { Link } from 'react-router-dom';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © {year} NN Company. Todos los derechos reservados.
        </p>

        {/* ¿Qué? Links legales obligatorios para cualquier sistema con cuentas de usuario. */}
        <nav aria-label="Links legales" className="flex items-center gap-4">
          <Link
            to="/terminos-de-uso"
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
          >
            Términos de uso
          </Link>
          <Link
            to="/politica-privacidad"
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
          >
            Privacidad
          </Link>
          <Link
            to="/politica-cookies"
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
          >
            Cookies
          </Link>
          <Link
            to="/contacto"
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
          >
            Contacto
          </Link>
        </nav>
      </div>
    </footer>
  );
}
