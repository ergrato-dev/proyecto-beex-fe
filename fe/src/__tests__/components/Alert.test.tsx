/**
 * Archivo: __tests__/components/Alert.test.tsx
 * Descripción: Tests unitarios del componente Alert.
 * ¿Para qué? Verificar que el feedback visual sea accesible (role="alert")
 *   y que todos los tipos se rendericen correctamente.
 * ¿Impacto? Alert se usa en todas las páginas de auth — un bug aquí
 *   rompería el feedback al usuario en toda la aplicación.
 */

import { render, screen } from '@testing-library/react';
import { Alert } from '@/components/ui/Alert';

describe('Alert', () => {
  it('muestra el mensaje recibido por prop', () => {
    render(<Alert type="error" message="Credenciales incorrectas." />);
    expect(screen.getByText('Credenciales incorrectas.')).toBeInTheDocument();
  });

  it('tiene role="alert" para que los lectores de pantalla lo anuncien', () => {
    render(<Alert type="success" message="Operación exitosa." />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('el rol "alert" contiene el mensaje completo', () => {
    const message = 'Se envió un enlace de recuperación.';
    render(<Alert type="info" message={message} />);
    expect(screen.getByRole('alert')).toHaveTextContent(message);
  });

  // ¿Qué? Verificar que los tres tipos se renderizan sin lanzar errores.
  it.each(['error', 'success', 'info'] as const)(
    'renderiza el tipo "%s" sin lanzar excepción',
    (type) => {
      expect(() =>
        render(<Alert type={type} message="Mensaje de prueba" />),
      ).not.toThrow();
    },
  );
});
