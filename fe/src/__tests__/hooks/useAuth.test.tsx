/**
 * Archivo: __tests__/hooks/useAuth.test.tsx
 * Descripción: Tests del hook personalizado useAuth.
 * ¿Para qué? Verificar que el hook provea acceso al contexto dentro del Provider
 *   y que lance un error descriptivo cuando se usa fuera de él.
 * ¿Impacto? Si el error no se lanza correctamente, los bugs de "context undefined"
 *   serían silenciosos y difíciles de depurar en producción.
 */

import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthProvider } from '@/context/AuthContext';
import { vi } from 'vitest';

// ¿Qué? Mock de la API para que AuthProvider no haga llamadas reales.
vi.mock('@/api/auth', () => ({
  getMe: vi.fn().mockRejectedValue(new Error('no token')),
  login: vi.fn(),
  register: vi.fn(),
}));

describe('useAuth', () => {
  it('lanza un error descriptivo si se usa fuera del AuthProvider', () => {
    // ¿Qué? renderHook sin wrapper significa que no hay AuthProvider en el árbol.
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth debe usarse dentro de un <AuthProvider>',
    );
  });

  it('retorna el contexto cuando está dentro del AuthProvider', () => {
    // ¿Qué? Wrapper que envuelve el hook en AuthProvider + MemoryRouter.
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MemoryRouter>
        <AuthProvider>{children}</AuthProvider>
      </MemoryRouter>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // ¿Qué? Verificar que los campos esenciales del contexto existen.
    expect(result.current.login).toBeTypeOf('function');
    expect(result.current.logout).toBeTypeOf('function');
    expect(result.current.register).toBeTypeOf('function');
    expect(typeof result.current.isAuthenticated).toBe('boolean');
    expect(typeof result.current.isLoading).toBe('boolean');
  });
});
