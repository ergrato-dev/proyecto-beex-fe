/**
 * Archivo: __tests__/components/ProtectedRoute.test.tsx
 * Descripción: Tests del componente ProtectedRoute.
 * ¿Para qué? Verificar que la protección de rutas funcione correctamente:
 *   loading state, redirección al login, y renderizado del contenido protegido.
 * ¿Impacto? Si falla esta lógica, rutas privadas quedan expuestas
 *   a cualquier usuario sin autenticar.
 */

import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ui/ProtectedRoute';

// ¿Qué? Mock del hook useAuth para controlar el estado de auth en cada test.
vi.mock('@/hooks/useAuth');
import { useAuth } from '@/hooks/useAuth';

const mockUseAuth = vi.mocked(useAuth);

// ¿Qué? Usuario de prueba para el estado autenticado.
const testUser = {
  id: 'test-1',
  email: 'user@test.com',
  fullName: 'Test User',
  isActive: true,
  createdAt: '2026-01-01T00:00:00Z',
};

/**
 * ¿Qué? Helper que renderiza ProtectedRoute dentro de un router simulado
 *   con rutas /dashboard y /login.
 */
function renderProtectedRoute() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <p>Contenido protegido</p>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<p>Página de login</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  it('muestra el indicador de carga mientras isLoading=true', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    renderProtectedRoute();
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
  });

  it('redirige a /login cuando isLoading=false y no está autenticado', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    renderProtectedRoute();
    // ¿Qué? El contenido protegido NO debe aparecer y se muestra login.
    expect(screen.getByText('Página de login')).toBeInTheDocument();
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
  });

  it('renderiza los hijos cuando el usuario está autenticado', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: testUser,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    renderProtectedRoute();
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
    expect(screen.queryByText('Página de login')).not.toBeInTheDocument();
  });
});
