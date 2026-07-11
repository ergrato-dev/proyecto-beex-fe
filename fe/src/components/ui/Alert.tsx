/**
 * Archivo: components/ui/Alert.tsx
 * Descripción: Componente de alerta para feedback visual de éxito o error.
 * ¿Para qué? Mostrar mensajes de resultado de operaciones (login fallido, registro
 *   exitoso, contraseña cambiada, etc.) de forma accesible y consistente.
 * ¿Impacto? Sin role="alert" los lectores de pantalla no anuncian el mensaje
 *   automáticamente cuando aparece.
 */

interface AlertProps {
  // ¿Qué? Tipo de alerta — determina el color y el icono.
  type: 'error' | 'success' | 'info';
  // ¿Qué? El mensaje a mostrar al usuario.
  message: string;
}

// ¿Qué? Mapa de clases Tailwind por tipo de alerta.
const TYPE_CLASSES: Record<AlertProps['type'], string> = {
  error:
    'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 ' +
    'text-red-700 dark:text-red-400',
  success:
    'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 ' +
    'text-green-700 dark:text-green-400',
  info:
    'bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 ' +
    'text-brand-700 dark:text-brand-400',
};

export function Alert({ type, message }: AlertProps) {
  return (
    // ¿Qué? role="alert" hace que el lector de pantalla anuncie el mensaje al aparecer.
    <div role="alert" className={`rounded-lg px-4 py-3 text-sm ${TYPE_CLASSES[type]}`}>
      {message}
    </div>
  );
}
