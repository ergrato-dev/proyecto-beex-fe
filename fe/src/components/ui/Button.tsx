/**
 * Archivo: components/ui/Button.tsx
 * Descripción: Botón reutilizable del design system del proyecto.
 * ¿Para qué? Centralizar estilos de botón para garantizar consistencia visual
 *   y evitar repetir las mismas clases de Tailwind en cada página.
 * ¿Impacto? Cambiar el estilo del botón aquí lo actualiza en toda la aplicación.
 */

import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  // ¿Qué? Variante visual del botón según su semántica de acción.
  variant?: 'primary' | 'secondary' | 'danger';
  // ¿Qué? Mostrar spinner cuando hay una operación en progreso.
  isLoading?: boolean;
}

// ¿Qué? Mapa de clases Tailwind por variante de botón.
// ¿Para qué? Separar las variantes facilita añadir nuevas sin condicionales en el JSX.
const VARIANT_CLASSES: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white',
  secondary:
    'bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700 ' +
    'text-gray-700 dark:text-slate-300 border border-gray-300 dark:border-slate-600',
  danger:
    'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white',
};

export function Button({
  variant = 'primary',
  isLoading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled ?? isLoading}
      aria-busy={isLoading}
      className={[
        'inline-flex items-center justify-center gap-2',
        'px-4 py-2 text-sm font-medium rounded-lg',
        'transition-colors duration-200',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANT_CLASSES[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {/* ¿Qué? Spinner accesible que reemplaza el texto mientras carga. */}
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span>Cargando...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
