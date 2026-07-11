/**
 * Archivo: components/layout/Footer.tsx
 * Descripción: Pie de página con links legales del sistema.
 * ¿Para qué? Proveer acceso a los documentos legales (términos, privacidad, cookies)
 *   y al contacto desde cualquier página de la aplicación.
 * ¿Impacto? Centralizar el footer evita duplicar links legales en cada página.
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* ¿Qué? Interpolación de {{year}} — i18next reemplaza el placeholder con el año actual. */}
        <p className="text-xs text-gray-500 dark:text-slate-400">
          {t('footer.copyright', { year })}
        </p>

        {/* ¿Qué? Links legales obligatorios para cualquier sistema con cuentas de usuario. */}
        <nav aria-label={t('nav.legalNavAriaLabel')} className="flex items-center gap-4">
          <Link
            to="/terminos-de-uso"
            className="text-xs text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors duration-200"
          >
            {t('footer.terms')}
          </Link>
          <Link
            to="/politica-privacidad"
            className="text-xs text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors duration-200"
          >
            {t('footer.privacy')}
          </Link>
          <Link
            to="/politica-cookies"
            className="text-xs text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors duration-200"
          >
            {t('footer.cookies')}
          </Link>
          <Link
            to="/contacto"
            className="text-xs text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors duration-200"
          >
            {t('footer.contact')}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
