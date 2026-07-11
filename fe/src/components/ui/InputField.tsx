/**
 * Archivo: components/ui/InputField.tsx
 * Descripción: Campo de formulario accesible con label, input y mensaje de error.
 * ¿Para qué? Evitar repetir el patrón label+input+error en cada formulario del proyecto.
 * ¿Impacto? Centraliza la accesibilidad (aria-invalid, aria-describedby) y el estilo
 *   de todos los inputs. Un cambio aquí aplica a todos los formularios.
 */

import type { InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  // ¿Qué? Texto del label visible — requerido para accesibilidad.
  label: string;
  // ¿Qué? ID único del input — necesario para vincular label y mensajes de error.
  id: string;
  // ¿Qué? Mensaje de error a mostrar bajo el input. Vacío = sin error.
  error?: string;
}

export function InputField({ label, id, error, className = '', ...props }: InputFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      {/* ¿Qué? Label vinculado al input por htmlFor — obligatorio WCAG AA. */}
      <label
        htmlFor={id}
        className="text-sm font-medium text-gray-700 dark:text-slate-300"
      >
        {label}
      </label>

      <input
        id={id}
        // ¿Qué? aria-invalid indica al lector de pantalla que el campo tiene error.
        aria-invalid={!!error}
        // ¿Qué? aria-describedby apunta al mensaje de error para que sea leído.
        aria-describedby={error ? errorId : undefined}
        className={[
          'w-full px-3 py-2 text-sm rounded-lg',
          'bg-white dark:bg-slate-800',
          'text-gray-900 dark:text-slate-100',
          'placeholder:text-gray-400 dark:placeholder:text-slate-500',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-0',
          error
            ? 'border border-red-500 dark:border-red-400'
            : 'border border-gray-300 dark:border-slate-600',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />

      {/* ¿Qué? Mensaje de error accesible con role="alert" para lectores de pantalla. */}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-xs text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}
