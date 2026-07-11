/**
 * Archivo: __tests__/helpers.tsx
 * Descripción: Utilidades compartidas para los tests del frontend.
 * ¿Para qué? Evitar repetir el boilerplate de renderizado con Router en cada test.
 * ¿Impacto? Centraliza la configuración de renderizado — un cambio aquí
 *   aplica a todos los tests que usen estos helpers.
 */

import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';

interface RenderWithRouterOptions {
  // ¿Qué? Lista de entradas del historial de navegación simulado.
  // Por defecto: ['/'] — emula estar en la raíz de la app.
  initialEntries?: string[];
}

/**
 * ¿Qué? Renderiza un componente envuelto en MemoryRouter.
 * ¿Para qué? Los componentes que usan hooks de react-router (useNavigate,
 *   useSearchParams, Link) necesitan estar dentro de un Router.
 * ¿Impacto? Sin este helper cada test necesitaría repetir el mismo boilerplate.
 */
export function renderWithRouter(
  ui: ReactNode,
  { initialEntries = ['/'] }: RenderWithRouterOptions = {},
) {
  return render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>);
}

/**
 * ¿Qué? Usuario mock con los datos mínimos válidos del tipo User.
 * ¿Para qué? Reutilizar en tests que necesitan simular un usuario autenticado.
 */
export const mockUser = {
  id: 'user-test-id-1',
  email: 'test@nn.com',
  fullName: 'Test User',
  isActive: true,
  createdAt: '2026-01-01T00:00:00Z',
};

/**
 * ¿Qué? Tokens mock del servidor.
 * ¿Para qué? Simular respuesta de login exitoso sin llamar a la API real.
 */
export const mockTokens = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  tokenType: 'bearer' as const,
};
