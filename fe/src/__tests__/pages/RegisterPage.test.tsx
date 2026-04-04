/**
 * Archivo: __tests__/pages/RegisterPage.test.tsx
 * Descripción: Tests de integración de la página de registro.
 * ¿Para qué? Verificar la validación client-side y el flujo de registro exitoso/fallido.
 * ¿Impacto? Si la validación falla silenciosamente, se podrían crear cuentas
 *   con contraseñas débiles — riesgo de seguridad (OWASP A07).
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RegisterPage } from '@/pages/RegisterPage';

// ¿Qué? Mock de useAuth para controlar el comportamiento de `register`.
vi.mock('@/hooks/useAuth');
import { useAuth } from '@/hooks/useAuth';

const mockUseAuth = vi.mocked(useAuth);
const mockRegisterFn = vi.fn();

/**
 * ¿Qué? Renderiza RegisterPage con las rutas necesarias para las redirecciones.
 */
function renderRegisterPage() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<p>Dashboard</p>} />
        <Route path="/login" element={<p>Login</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RegisterPage', () => {
  beforeEach(() => {
    mockRegisterFn.mockReset();
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: vi.fn(),
      register: mockRegisterFn,
      logout: vi.fn(),
    });
  });

  it('renderiza los 4 campos del formulario de registro', () => {
    renderRegisterPage();
    expect(screen.getByLabelText('Nombre completo')).toBeInTheDocument();
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar contraseña')).toBeInTheDocument();
  });

  it('muestra error de validación cuando la contraseña es débil', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    await user.type(screen.getByLabelText('Nombre completo'), 'Ana García');
    await user.type(
      screen.getByLabelText('Correo electrónico'),
      'ana@nn.com',
    );
    // ¿Qué? Contraseña débil — sin mayúscula ni número.
    await user.type(screen.getByLabelText('Contraseña'), 'password');
    await user.type(
      screen.getByLabelText('Confirmar contraseña'),
      'password',
    );
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    // ¿Qué? No debe llamar a register — la validación client-side debe detenerlo.
    expect(mockRegisterFn).not.toHaveBeenCalled();
    expect(
      screen.getByText(/mínimo 8 caracteres/i),
    ).toBeInTheDocument();
  });

  it('muestra error cuando las contraseñas no coinciden', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    await user.type(screen.getByLabelText('Nombre completo'), 'Ana García');
    await user.type(
      screen.getByLabelText('Correo electrónico'),
      'ana@nn.com',
    );
    await user.type(screen.getByLabelText('Contraseña'), 'Password1');
    await user.type(
      screen.getByLabelText('Confirmar contraseña'),
      'OtraPassword1',
    );
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    expect(mockRegisterFn).not.toHaveBeenCalled();
    expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument();
  });

  it('llama a register con fullName, email y password en datos válidos', async () => {
    const user = userEvent.setup();
    mockRegisterFn.mockResolvedValue(undefined);
    renderRegisterPage();

    await user.type(screen.getByLabelText('Nombre completo'), 'Ana García');
    await user.type(
      screen.getByLabelText('Correo electrónico'),
      'ana@nn.com',
    );
    await user.type(screen.getByLabelText('Contraseña'), 'Password1');
    await user.type(
      screen.getByLabelText('Confirmar contraseña'),
      'Password1',
    );
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    expect(mockRegisterFn).toHaveBeenCalledWith({
      fullName: 'Ana García',
      email: 'ana@nn.com',
      password: 'Password1',
    });
  });

  it('redirige al dashboard después del registro exitoso', async () => {
    const user = userEvent.setup();
    mockRegisterFn.mockResolvedValue(undefined);
    renderRegisterPage();

    await user.type(screen.getByLabelText('Nombre completo'), 'Ana García');
    await user.type(
      screen.getByLabelText('Correo electrónico'),
      'ana@nn.com',
    );
    await user.type(screen.getByLabelText('Contraseña'), 'Password1');
    await user.type(
      screen.getByLabelText('Confirmar contraseña'),
      'Password1',
    );
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
  });

  it('muestra el error del servidor cuando el email ya está registrado', async () => {
    const user = userEvent.setup();
    mockRegisterFn.mockRejectedValue(new Error('El correo ya está registrado.'));
    renderRegisterPage();

    await user.type(screen.getByLabelText('Nombre completo'), 'Ana García');
    await user.type(
      screen.getByLabelText('Correo electrónico'),
      'existente@nn.com',
    );
    await user.type(screen.getByLabelText('Contraseña'), 'Password1');
    await user.type(
      screen.getByLabelText('Confirmar contraseña'),
      'Password1',
    );
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    expect(
      await screen.findByText('El correo ya está registrado.'),
    ).toBeInTheDocument();
  });
});
