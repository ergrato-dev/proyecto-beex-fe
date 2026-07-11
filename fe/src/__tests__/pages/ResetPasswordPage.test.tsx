/**
 * Archivo: __tests__/pages/ResetPasswordPage.test.tsx
 * Descripción: Tests de la página de restablecimiento de contraseña.
 * ¿Para qué? Verificar el manejo del token JWT del email — sin token la página
 *   debe mostrar error inmediato y con token debe completar el flujo.
 * ¿Impacto? Si el token se ignora o se valida mal, cualquier URL podría
 *   restablecer contraseñas sin autorización.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';

// ¿Qué? Mock del módulo de API para controlar las respuestas del servidor.
vi.mock('@/api/auth');
import * as authApi from '@/api/auth';

const mockResetPassword = vi.mocked(authApi.resetPassword);

/**
 * ¿Qué? Renderiza ResetPasswordPage con o sin token en la URL.
 * ¿Para qué? Probar tanto el caso de enlace inválido (sin token) como
 *   el caso normal (con token en el query param).
 */
function renderResetPage(token?: string) {
  const path = token ? `/reset-password?token=${token}` : '/reset-password';
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/login" element={<p>Página de login</p>} />
        <Route path="/forgot-password" element={<p>Solicitar nuevo enlace</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    mockResetPassword.mockReset();
  });

  it('muestra alerta de error cuando no hay token en la URL', () => {
    renderResetPage(); // sin token
    expect(screen.getByRole('alert')).toHaveTextContent(
      /enlace de recuperación es inválido/i,
    );
    // ¿Qué? El formulario no debe aparecer — no hay input de contraseña.
    expect(screen.queryByLabelText(/contraseña/i)).not.toBeInTheDocument();
  });

  it('renderiza el formulario cuando hay token válido en la URL', () => {
    renderResetPage('valid-token-abc');
    expect(screen.getByLabelText('Nueva contraseña')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar contraseña')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /restablecer contraseña/i }),
    ).toBeInTheDocument();
  });

  it('muestra error de validación cuando la contraseña no cumple los requisitos', async () => {
    const user = userEvent.setup();
    renderResetPage('valid-token-abc');

    await user.type(screen.getByLabelText('Nueva contraseña'), 'weak');
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'weak');
    await user.click(
      screen.getByRole('button', { name: /restablecer contraseña/i }),
    );

    expect(screen.getByText(/mínimo 8 caracteres/i)).toBeInTheDocument();
    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  it('muestra error de validación cuando las contraseñas no coinciden', async () => {
    const user = userEvent.setup();
    renderResetPage('valid-token-abc');

    await user.type(screen.getByLabelText('Nueva contraseña'), 'Password1');
    await user.type(
      screen.getByLabelText('Confirmar contraseña'),
      'OtraPassword1',
    );
    await user.click(
      screen.getByRole('button', { name: /restablecer contraseña/i }),
    );

    expect(
      screen.getByText('Las contraseñas no coinciden.'),
    ).toBeInTheDocument();
    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  it('llama a resetPassword con el token de la URL y la nueva contraseña', async () => {
    const user = userEvent.setup();
    mockResetPassword.mockResolvedValue(undefined);
    renderResetPage('the-reset-token-xyz');

    await user.type(screen.getByLabelText('Nueva contraseña'), 'NuevaClave1');
    await user.type(
      screen.getByLabelText('Confirmar contraseña'),
      'NuevaClave1',
    );
    await user.click(
      screen.getByRole('button', { name: /restablecer contraseña/i }),
    );

    expect(mockResetPassword).toHaveBeenCalledWith({
      token: 'the-reset-token-xyz',
      newPassword: 'NuevaClave1',
    });
  });

  it('muestra mensaje de éxito después de restablecer la contraseña', async () => {
    const user = userEvent.setup();
    mockResetPassword.mockResolvedValue(undefined);
    renderResetPage('valid-token-abc');

    await user.type(screen.getByLabelText('Nueva contraseña'), 'Password1');
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'Password1');
    await user.click(
      screen.getByRole('button', { name: /restablecer contraseña/i }),
    );

    // ¿Qué? El mensaje de éxito incluye aviso de redirección al login.
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/restablecida correctamente/i);
  });

  it('muestra alerta de error cuando el token es inválido o expirado', async () => {
    const user = userEvent.setup();
    mockResetPassword.mockRejectedValue(
      new Error('El enlace expiró o ya fue utilizado.'),
    );
    renderResetPage('expired-token');

    await user.type(screen.getByLabelText('Nueva contraseña'), 'Password1');
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'Password1');
    await user.click(
      screen.getByRole('button', { name: /restablecer contraseña/i }),
    );

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/expiró o ya fue utilizado/i);
  });
});
