/**
 * Archivo: __tests__/pages/LoginPage.test.tsx
 * Descripción: Tests de integración de la página de inicio de sesión.
 * ¿Para qué? Verificar que el formulario valide los datos, llame al hook de auth
 *   correctamente y reaccione a éxito/error del servidor.
 * ¿Impacto? LoginPage es la puerta de entrada al sistema — cualquier bug aquí
 *   bloquea a todos los usuarios registrados.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from '@/pages/LoginPage';

// ¿Qué? Mock de useAuth para aislar LoginPage de la lógica del contexto real.
vi.mock('@/hooks/useAuth');
import { useAuth } from '@/hooks/useAuth';

const mockUseAuth = vi.mocked(useAuth);
const mockLoginFn = vi.fn();

/**
 * ¿Qué? Renderiza LoginPage con routing simulado.
 * ¿Para qué? LoginPage usa useNavigate para redirigir al dashboard,
 *   que requiere estar dentro de un Router con la ruta /dashboard presente.
 */
function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<p>Bienvenido al dashboard</p>} />
        <Route
          path="/forgot-password"
          element={<p>Página de recuperación</p>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    mockLoginFn.mockReset();
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: mockLoginFn,
      register: vi.fn(),
      logout: vi.fn(),
    });
  });

  it('renderiza el formulario con los campos de correo y contraseña', () => {
    renderLoginPage();
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /iniciar sesión/i }),
    ).toBeInTheDocument();
  });

  it('muestra el enlace "¿Olvidaste tu contraseña?"', () => {
    renderLoginPage();
    expect(
      screen.getByRole('link', { name: /olvidaste tu contraseña/i }),
    ).toBeInTheDocument();
  });

  it('actualiza los campos de formulario al escribir', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    const emailInput = screen.getByLabelText('Correo electrónico');
    const passwordInput = screen.getByLabelText('Contraseña');

    await user.type(emailInput, 'test@nn.com');
    await user.type(passwordInput, 'Password1');

    expect(emailInput).toHaveValue('test@nn.com');
    expect(passwordInput).toHaveValue('Password1');
  });

  it('llama a login con email y contraseña al enviar el formulario', async () => {
    const user = userEvent.setup();
    mockLoginFn.mockResolvedValue(undefined);
    renderLoginPage();

    await user.type(screen.getByLabelText('Correo electrónico'), 'test@nn.com');
    await user.type(screen.getByLabelText('Contraseña'), 'Password1');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(mockLoginFn).toHaveBeenCalledWith({
      email: 'test@nn.com',
      password: 'Password1',
    });
  });

  it('redirige al dashboard después de un login exitoso', async () => {
    const user = userEvent.setup();
    mockLoginFn.mockResolvedValue(undefined);
    renderLoginPage();

    await user.type(screen.getByLabelText('Correo electrónico'), 'test@nn.com');
    await user.type(screen.getByLabelText('Contraseña'), 'Password1');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(await screen.findByText('Bienvenido al dashboard')).toBeInTheDocument();
  });

  it('muestra alerta de error cuando el login falla', async () => {
    const user = userEvent.setup();
    mockLoginFn.mockRejectedValue(new Error('Credenciales incorrectas.'));
    renderLoginPage();

    await user.type(
      screen.getByLabelText('Correo electrónico'),
      'wrong@nn.com',
    );
    await user.type(screen.getByLabelText('Contraseña'), 'badpass');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Credenciales incorrectas.');
  });

  it('el botón muestra "Cargando..." mientras la petición está en vuelo', async () => {
    const user = userEvent.setup();
    // ¿Qué? Promesa que nunca resuelve — simula petición lenta.
    mockLoginFn.mockReturnValue(new Promise(() => {}));
    renderLoginPage();

    await user.type(screen.getByLabelText('Correo electrónico'), 'test@nn.com');
    await user.type(screen.getByLabelText('Contraseña'), 'Password1');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(await screen.findByText('Cargando...')).toBeInTheDocument();
  });
});
