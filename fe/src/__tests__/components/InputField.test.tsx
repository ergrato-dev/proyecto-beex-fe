/**
 * Archivo: __tests__/components/InputField.test.tsx
 * Descripción: Tests unitarios del componente InputField.
 * ¿Para qué? Verificar que el vínculo label-input y los atributos ARIA
 *   de accesibilidad funcionen correctamente.
 * ¿Impacto? InputField está en todos los formularios — si pierde el label
 *   o los aria-attributes, la aplicación falla WCAG AA.
 */

import { render, screen } from '@testing-library/react';
import { InputField } from '@/components/ui/InputField';

describe('InputField', () => {
  it('renderiza el label vinculado al input mediante htmlFor/id', () => {
    render(<InputField id="email" label="Correo electrónico" />);
    // getByLabelText funciona SOLO si htmlFor del label coincide con id del input
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
  });

  it('muestra el mensaje de error cuando se provee la prop error', () => {
    render(<InputField id="email" label="Email" error="Campo requerido" />);
    expect(screen.getByText('Campo requerido')).toBeInTheDocument();
  });

  it('aplica aria-invalid="true" al input cuando hay error', () => {
    render(<InputField id="email" label="Email" error="Campo inválido" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('aplica aria-invalid="false" al input cuando no hay error', () => {
    render(<InputField id="email" label="Email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('aria-describedby apunta al id del párrafo de error', () => {
    render(<InputField id="nombre" label="Nombre" error="Requerido" />);
    const input = screen.getByLabelText('Nombre');
    // ¿Qué? El input describe su error por id nombre-error
    expect(input).toHaveAttribute('aria-describedby', 'nombre-error');
    expect(screen.getByRole('alert')).toHaveAttribute('id', 'nombre-error');
  });

  it('no tiene aria-describedby cuando no hay error', () => {
    render(<InputField id="nombre" label="Nombre" />);
    expect(screen.getByLabelText('Nombre')).not.toHaveAttribute('aria-describedby');
  });

  it('no muestra párrafo de error cuando error está vacío', () => {
    render(<InputField id="nombre" label="Nombre" />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
