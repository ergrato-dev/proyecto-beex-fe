/**
 * Archivo: components/ui/LanguageToggle.tsx
 * Descripción: Botón para alternar entre español e inglés.
 * ¿Para qué? Permitir al usuario cambiar el idioma de la interfaz y que la
 *   preferencia se persista en localStorage para futuras visitas.
 * ¿Impacto? Sin este componente el usuario no puede cambiar el idioma manualmente.
 *   Debe colocarse en la barra de navegación, junto al ThemeToggle.
 */

import { useTranslation } from 'react-i18next';
import { changeLanguage, SUPPORTED_LANGUAGES } from '@/i18n';
import type { SupportedLanguage } from '@/i18n';

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const current = i18n.language as SupportedLanguage;

  return (
    // ¿Qué? Contenedor flex que muestra los idiomas separados por un pipe vertical.
    <div className="flex items-center gap-0.5 text-xs font-medium" role="group" aria-label="Selector de idioma">
      {SUPPORTED_LANGUAGES.map((lang, idx) => (
        // ¿Qué? Fragment necesario para renderizar el separador "|" entre botones.
        <span key={lang} className="flex items-center gap-0.5">
          {/* ¿Qué? Separador visual entre opciones de idioma. */}
          {idx > 0 && (
            <span className="text-gray-300 dark:text-slate-700 select-none px-0.5" aria-hidden="true">
              |
            </span>
          )}
          <button
            onClick={() => changeLanguage(lang)}
            // ¿Qué? El idioma activo se muestra en contraste alto; el inactivo, atenuado.
            // ¿Para qué? Indicar visualmente cuál idioma está seleccionado (WCAG 1.4.1).
            className={[
              'px-1.5 py-1 rounded transition-colors duration-200',
              current === lang
                ? 'text-gray-900 dark:text-slate-100 font-semibold'
                : 'text-gray-400 dark:text-slate-600 hover:text-gray-700 dark:hover:text-slate-300',
            ].join(' ')}
            aria-pressed={current === lang}
            aria-label={`Cambiar idioma a ${lang.toUpperCase()}`}
          >
            {lang.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}
