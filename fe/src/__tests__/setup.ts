/**
 * Archivo: __tests__/setup.ts
 * Descripción: Configuración global de Vitest para los tests del frontend.
 * ¿Para qué? Importar @testing-library/jest-dom para que los matchers como
 *   toBeInTheDocument, toHaveValue, etc. estén disponibles en todos los tests.
 * ¿Impacto? Sin esta línea los matchers de Testing Library no están disponibles
 *   y los tests fallan con "TypeError: expect(...).toBeInTheDocument is not a function".
 *
 *   También importa i18n para que t() resuelva el español (idioma por defecto)
 *   y los queries por texto ('Correo electrónico', 'Contraseña', etc.) sigan funcionando.
 */

import '@testing-library/jest-dom';
// ¿Qué? Inicializar i18next con initImmediate:false antes de cualquier test.
// ¿Para qué? Sin esto t() devuelve la clave cruda ('auth.emailLabel') y los
//   getByLabelText / getByText fallan porque no encuentran el texto español.
import '@/i18n';
