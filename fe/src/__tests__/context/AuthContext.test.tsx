/**
 * Archivo: __tests__/context/AuthContext.test.tsx
 * Descripción: Tests de integración del AuthProvider.
 * ¿Para qué? Verificar los flujos de login, logout y restauración de sesión
 *   que son el corazón del sistema de autenticación.
 * ¿Impacto? Un bug en el AuthProvider afecta TODA la app — es el componente
 *   más crítico del frontend.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import { mockUser, mockTokens } from '@/__tests__/helpers';

// ¿Qué? Mock del módulo de API — ningún test debe hacer llamadas HTTP reales.
vi.mock('@/api/auth');
import * as authApi from '@/api/auth';

const mockGetMe = vi.mocked(authApi.getMe);
const mockLogin = vi.mocked(authApi.login);

/**
 * ¿Qué? Componente de prueba que expone el estado del AuthContext en el DOM.
 * ¿Para qué? Permite a los tests verificar el estado del contexto sin
 *   acceder directamente a la implementación interna.
 */
function AuthStateConsumer() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      await login({ email: 'user@nn.com', password: 'Pass123' });
    } catch (e) {
      setLoginError(e instanceof Error ? e.message : 'error');
    }
  };

  if (isLoading) {
    return <p>loading</p>;
  }

  return (
    <div>
      <p data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</p>
      {user && <p data-testid="user-email">{user.email}</p>}
      {loginError && <p data-testid="login-error">{loginError}</p>}
      <button onClick={handleLogin}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  );
}

/**
 * ¿Qué? Helper para renderizar el AuthProvider con el consumer de prueba.
 */
function renderAuthProvider() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <AuthStateConsumer />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    // ¿Qué? Limpiar localStorage y restablecer mocks antes de cada test.
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('comienza en estado no-autenticado cuando no hay token en localStorage', async () => {
    // ¿Qué? Sin token, el useEffect sale inmediatamente con isLoading=false.
    renderAuthProvider();
    // Podría mostrar "loading" brevemente, luego "not-authenticated"
    await screen.findByTestId('auth-status');
    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
  });

  it('restaura la sesión si hay un token válido en localStorage', async () => {
    // ¿Qué? Simular que el usuario ya tenía sesión activa (token guardado).
    localStorage.setItem('accessToken', 'valid-access-token');
    mockGetMe.mockResolvedValue(mockUser);

    renderAuthProvider();
    // ¿Qué? Esperar a que getMe resuelva y el estado se actualice.
    await screen.findByTestId('user-email');
    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('user-email')).toHaveTextContent(mockUser.email);
  });

  it('limpia los tokens si getMe falla durante la restauración de sesión', async () => {
    localStorage.setItem('accessToken', 'expired-token');
    localStorage.setItem('refreshToken', 'expired-refresh');
    mockGetMe.mockRejectedValue(new Error('Token expired'));

    renderAuthProvider();
    await screen.findByTestId('auth-status');

    // ¿Qué? El token inválido debe ser eliminado del storage.
    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });

  it('autentica al usuario y guarda tokens tras un login exitoso', async () => {
    // ¿Qué? Simular que el servidor devuelve tokens y perfil al hacer login.
    mockLogin.mockResolvedValue(mockTokens);
    mockGetMe.mockResolvedValue(mockUser);

    renderAuthProvider();
    await screen.findByTestId('auth-status');
    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');

    // ¿Qué? Hacer click en el botón de login del consumer de prueba.
    fireEvent.click(screen.getByRole('button', { name: 'login' }));

    await screen.findByTestId('user-email');
    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('user-email')).toHaveTextContent(mockUser.email);
    expect(localStorage.getItem('accessToken')).toBe(mockTokens.accessToken);
  });

  it('limpia el usuario y los tokens al hacer logout', async () => {
    // ¿Qué? Partir de un estado autenticado para poder hacer logout.
    localStorage.setItem('accessToken', 'valid-token');
    mockGetMe.mockResolvedValue(mockUser);

    renderAuthProvider();
    await screen.findByTestId('user-email');
    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');

    // ¿Qué? Hacer logout y verificar que el estado vuelve a no-autenticado.
    fireEvent.click(screen.getByRole('button', { name: 'logout' }));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    });
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(screen.queryByTestId('user-email')).not.toBeInTheDocument();
  });

  it('expone el error cuando login falla', async () => {
    mockLogin.mockRejectedValue(new Error('Credenciales inválidas'));

    renderAuthProvider();
    await screen.findByTestId('auth-status');

    fireEvent.click(screen.getByRole('button', { name: 'login' }));

    await screen.findByTestId('login-error');
    expect(screen.getByTestId('login-error')).toHaveTextContent('Credenciales inválidas');
  });
});
