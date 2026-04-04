/**
 * Archivo: __tests__/components/Button.test.tsx
 * Descripción: Tests unitarios del componente Button.
 * ¿Para qué? Verificar que el estado de loading y disabled sean accesibles
 *   y que los eventos de click funcionen como se espera.
 * ¿Impacto? Button está en todos los formularios del sistema de auth —
 *   un bug en el estado loading podría permitir envíos duplicados.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renderiza el texto de sus hijos', () => {
    render(<Button>Enviar</Button>);
    expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument();
  });

  it('muestra "Cargando..." y deshabilita el botón cuando isLoading=true', () => {
    render(<Button isLoading>Enviar</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('está deshabilitado cuando se pasa la prop disabled', () => {
    render(<Button disabled>Enviar</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('invoca onClick al hacer click en estado normal', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('NO invoca onClick cuando el botón está deshabilitado', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Click
      </Button>,
    );
    await user.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('NO invoca onClick cuando isLoading=true', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <Button isLoading onClick={handleClick}>
        Enviar
      </Button>,
    );
    await user.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it.each([
    ['primary', 'Guardar'],
    ['secondary', 'Cancelar'],
    ['danger', 'Eliminar'],
  ] as const)('renderiza la variante "%s" sin errores', (variant, label) => {
    render(<Button variant={variant}>{label}</Button>);
    expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
  });
});
