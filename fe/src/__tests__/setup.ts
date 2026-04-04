/**
 * Archivo: __tests__/setup.ts
 * Descripción: Configuración global de Vitest para los tests del frontend.
 * ¿Para qué? Importar @testing-library/jest-dom para que los matchers como
 *   toBeInTheDocument, toHaveValue, etc. estén disponibles en todos los tests.
 * ¿Impacto? Sin esta línea los matchers de Testing Library no están disponibles
 *   y los tests fallan con "TypeError: expect(...).toBeInTheDocument is not a function".
 */

import '@testing-library/jest-dom';
