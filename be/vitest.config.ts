/**
 * Archivo: vitest.config.ts
 * Descripción: Configuración de Vitest para los tests del backend.
 * ¿Para qué? Indicar a Vitest dónde están los archivos de setup, el entorno
 *   de ejecución (Node.js) y habilitar la cobertura de código.
 * ¿Impacto? Sin esta configuración Vitest no cargaría el setup.ts y los tests
 *   no tendrían la BD limpia entre ejecuciones.
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // ¿Qué? Entorno de ejecución Node.js (no browser).
    // ¿Para qué? Los tests del backend usan APIs de Node — net, crypto, etc.
    environment: 'node',

    // ¿Qué? Archivos que se ejecutan antes de cada suite de tests.
    // ¿Para qué? El setup.ts limpia la BD entre tests para garantizar aislamiento.
    setupFiles: ['./src/tests/setup.ts'],

    // ¿Qué? Archivos que vitest incluye como tests.
    include: ['src/**/*.test.ts'],

    // ¿Qué? Reporte de cobertura usando el provider v8 de Node.js.
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      // ¿Qué? Solo medir cobertura de código fuente, no de tests ni tipos.
      include: ['src/**/*.ts'],
      exclude: ['src/tests/**', 'src/types/**', 'src/**/*.d.ts'],
      // ¿Qué? Umbral mínimo de cobertura exigido por el proyecto (80%).
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
      },
    },
  },
});
