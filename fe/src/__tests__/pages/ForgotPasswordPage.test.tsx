/**
 * Archivo: __tests__/pages/ForgotPasswordPage.test.tsx
 * Descripción: Tests de la página de recuperación de contraseña.
 * ¿Para qué? Verificar el principio OWASP A07 — la respuesta siempre es
 *   "éxito" independientemente de si el email existe o la API falla.
 * ¿Impacto? Si en algún caso se muestra un error diferente al del éxito,
 *   un atacante puede enumerar qué emails están registrados en el sistema.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';

// ¿Qué? Mock del módulo de API para controlar las respuestas del servidor.
vi.mock('@/api/auth');
import * as authApi from '@/api/auth';

const mockForgotPassword = vi.mocked(authApi.forgotPassword);

function renderForgotPasswordPage() {
  return render(
    <MemoryRouter initialEntries={['/forgot-password']}>
      <Routes>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/login" element={<p>Login</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    mockForgotPassword.mockReset();
  });

  it('renderiza el campo de correo electrónico y el botón de envío', () => {
    renderForgotPasswordPage();
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /enviar enlace/i }),
    ).toBeInTheDocument();
  });

  it('muestra error de validación si el email no tiene "@"', async () => {
    const user = userEvent.setup();
    renderForgotPasswordPage();

    await user.type(
      screen.getByLabelText('Correo electrónico'),
      'correo-invalido',
    );
    await user.click(screen.getByRole('button', { name: /enviar enlace/i }));

    expect(
      screen.getByText(/ingresa un correo electrónico válido/i),
    ).toBeInTheDocument();
    // ¿Qué? La API no debe ser llamada si el email es inválido.
    expect(mockForgotPassword).not.toHaveBeenCalled();
  });

  it(
    'siempre muestra el mensaje de éxito cuando la API responde correctamente' +
      ' — OWASP A07 anti-enumeración',
    async () => {
      const user = userEvent.setup();
      // ¿Qué? API responde con éxito (email registrado).
      mockForgotPassword.mockResolvedValue(undefined);
      renderForgotPasswordPage();

      await user.type(
        screen.getByLabelText('Correo electrónico'),
        'registrado@nn.com',
      );
      await user.click(screen.getByRole('button', { name: /enviar enlace/i }));

      // ¿Qué? El mensaje es genérico — no diferencia entre email registrado y no registrado.
      expect(await screen.findByRole('alert')).toHaveTextContent(
        /si tu correo está registrado/i,
      );
    },
  );

  it(
    'siempre muestra el mensaje de éxito INCLUSO cuando la API falla' +
      ' — OWASP A07 anti-enumeración',
    async () => {
      const user = userEvent.setup();
      // ¿Qué? API lanza error (email no registrado o fallo del servidor).
      mockForgotPassword.mockRejectedValue(new Error('Email not found'));
      renderForgotPasswordPage();

      await user.type(
        screen.getByLabelText('Correo electrónico'),
        'noexiste@nn.com',
      );
      await user.click(screen.getByRole('button', { name: /enviar enlace/i }));

      // ¿Qué? El mismo mensaje se muestra independientemente del resultado de la API.
      expect(await screen.findByRole('alert')).toHaveTextContent(
        /si tu correo está registrado/i,
      );
    },
  );

  it('muestra el botón "Cargando..." mientras la petición está en vuelo', async () => {
    const user = userEvent.setup();
    // ¿Qué? Promesa que nunca resuelve — simula petición lenta.
    mockForgotPassword.mockReturnValue(new Promise(() => {}));
    renderForgotPasswordPage();

    await user.type(
      screen.getByLabelText('Correo electrónico'),
      'test@nn.com',
    );
    await user.click(screen.getByRole('button', { name: /enviar enlace/i }));

    expect(await screen.findByText('Cargando...')).toBeInTheDocument();
  });
});
