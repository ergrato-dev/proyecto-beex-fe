/**
 * Archivo: components/ui/ThemeToggle.tsx
 * Descripción: Botón para alternar entre tema claro y oscuro.
 * ¿Para qué? Permitir al usuario elegir su tema independientemente de la
 *   preferencia del sistema operativo.
 * ¿Impacto? Sin este botón el usuario no puede cambiar el tema manualmente.
 */

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
      className={[
        'p-2 rounded-lg',
        'text-gray-600 dark:text-slate-400',
        'hover:bg-gray-100 dark:hover:bg-slate-800',
        'transition-colors duration-200',
      ].join(' ')}
    >
      {/* ¿Qué? aria-hidden=true en íconos decorativos — el aria-label del botón ya describe la acción. */}
      {theme === 'light' ? (
        <Moon className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Sun className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}
