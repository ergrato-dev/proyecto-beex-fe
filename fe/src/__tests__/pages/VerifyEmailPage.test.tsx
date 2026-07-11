/**
 * Archivo: __tests__/pages/VerifyEmailPage.test.tsx
 * Descripción: Tests de la página de verificación de email.
 * ¿Para qué? Verificar que el componente reacciona correctamente a los
 *   4 estados posibles: sin token, procesando, éxito y error de la API.
 * ¿Impacto? Si la lógica de estados falla, los usuarios quedan atrapados
 *   sin feedback claro — no saben si su cuenta fue activada o no.
 */

import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { VerifyEmailPage } from '@/pages/VerifyEmailPage';

// ¿Qué? Mock del módulo de API para controlar las respuestas del servidor.
// ¿Para qué? Aislar los tests del servidor real y poder simular éxito/error.
vi.mock('@/api/auth');
import * as authApi from '@/api/auth';

const mockVerifyEmail = vi.mocked(authApi.verifyEmail);

/**
 * ¿Qué? Renderiza VerifyEmailPage con o sin token en la URL.
 * ¿Para qué? Probar el estado missingToken (sin token) y los flujos
 *   processing/success/error (con token).
 */
function renderVerifyPage(token?: string) {
  const path = token ? `/verify-email?token=${token}` : '/verify-email';
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/login" element={<p>Página de login</p>} />
        <Route path="/register" element={<p>Página de registro</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    mockVerifyEmail.mockReset();
  });

  // ─── Estado: missingToken ─────────────────────────────────────────────────

  it('muestra alerta de error cuando no hay token en la URL', () => {
    renderVerifyPage(); // sin token

    // ¿Qué? Debe mostrarse el mensaje de token ausente inmediatamente.
    // ¿Para qué? El usuario llegó por un enlace roto — necesita saber qué hacer.
    expect(screen.getByRole('alert')).toHaveTextContent(
      /no se encontró el token de verificación/i,
    );
    // ¿Qué? No debe intentar llamar a la API sin token.
    expect(mockVerifyEmail).not.toHaveBeenCalled();
  });

  it('muestra botón de registro en estado missingToken', () => {
    renderVerifyPage();

    expect(
      screen.getByRole('button', { name: /crear cuenta/i }),
    ).toBeInTheDocument();
  });

  // ─── Estado: processing → success ────────────────────────────────────────

  it('llama a la API con el token de la URL al montar el componente', async () => {
    mockVerifyEmail.mockResolvedValue(undefined);
    renderVerifyPage('abc-token-123');

    // ¿Qué? La llamada debe ocurrir automáticamente — sin interacción del usuario.
    await waitFor(() =>
      expect(mockVerifyEmail).toHaveBeenCalledWith({ token: 'abc-token-123' }),
    );
  });

  it('muestra estado de éxito cuando la API responde correctamente', async () => {
    mockVerifyEmail.mockResolvedValue(undefined);
    renderVerifyPage('valid-token');

    // ¿Qué? Esperar que el estado de éxito reemplace al spinner.
    expect(
      await screen.findByText(/¡cuenta activada!/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/tu correo ha sido verificado/i),
    ).toBeInTheDocument();
  });

  it('muestra botón de login en estado de éxito', async () => {
    mockVerifyEmail.mockResolvedValue(undefined);
    renderVerifyPage('valid-token');

    const loginBtn = await screen.findByRole('button', { name: /ir al inicio de sesión/i });
    expect(loginBtn).toBeInTheDocument();
  });

  it('no muestra el spinner de carga tras verificación exitosa', async () => {
    mockVerifyEmail.mockResolvedValue(undefined);
    renderVerifyPage('valid-token');

    await screen.findByText(/¡cuenta activada!/i);
    // ¿Qué? El spinner usa role="status" — no debe estar visible tras el éxito.
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  // ─── Estado: error ────────────────────────────────────────────────────────

  it('muestra el error de la API cuando el token es inválido', async () => {
    mockVerifyEmail.mockRejectedValue(new Error('El token de verificación es inválido o ha expirado.'));
    renderVerifyPage('expired-token');

    expect(
      await screen.findByText(/el token de verificación es inválido/i),
    ).toBeInTheDocument();
  });

  it('muestra estado de error con título "Enlace inválido"', async () => {
    mockVerifyEmail.mockRejectedValue(new Error('Token expirado'));
    renderVerifyPage('bad-token');

    await screen.findByRole('alert');
    expect(screen.getByRole('alert')).toHaveTextContent(/enlace inválido/i);
  });

  it('muestra botón de registro en estado de error', async () => {
    mockVerifyEmail.mockRejectedValue(new Error('Token ya utilizado'));
    renderVerifyPage('used-token');

    // ¿Qué? En caso de error, ofrecer al usuario la opción de registrarse de nuevo.
    const registerBtn = await screen.findByRole('button', { name: /crear cuenta/i });
    expect(registerBtn).toBeInTheDocument();
  });
});
