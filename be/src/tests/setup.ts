/**
 * Archivo: tests/setup.ts
 * Descripción: Configuración global ejecutada antes de todos los tests del backend.
 * ¿Para qué? Inicializar y limpiar la BD de tests, asegurar entorno aislado.
 * ¿Impacto? Sin una BD de tests aislada, los tests afectarían datos reales.
 */

import { beforeAll, afterAll, beforeEach } from 'vitest';
import { db } from '../db/index.js';

// ¿Qué? Limpiar todas las tablas antes de cada test.
// ¿Para qué? Garantizar que cada test parte de un estado limpio y predecible.
// ¿Impacto? Sin limpiar, el orden de ejecución de tests podría causar fallas intermitentes.
// ¿Por qué este orden? Las FKs de passwordResetToken y emailVerificationToken apuntan
//   a user — deben eliminarse primero para evitar errores de integridad referencial.
beforeEach(async () => {
  await db.passwordResetToken.deleteMany();
  await db.emailVerificationToken.deleteMany();
  await db.user.deleteMany();
});

// ¿Qué? Verificar que la conexión a la BD de tests está disponible antes de empezar.
beforeAll(async () => {
  // La BD de tests se establece via DATABASE_URL en el entorno de test.
  // Asegurarse de que .env.test o la variable de entorno apunte a una BD de pruebas.
  console.log('🧪 Setup: BD de tests conectada');
});

afterAll(async () => {
  console.log('🧪 Teardown: tests completados');
});
