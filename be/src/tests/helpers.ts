/**
 * Archivo: tests/helpers.ts
 * Descripción: Helpers reutilizables para los tests del backend.
 * ¿Para qué? Evitar repetir código de setup en cada archivo de tests.
 * ¿Impacto? Centralizar la creación de datos de prueba facilita el mantenimiento.
 */

import request from 'supertest';
import app from '../app.js';

// ¿Qué? Datos de usuario válido para reutilizar en múltiples tests.
export const TEST_USER = {
  email: 'test@nn-company.com',
  fullName: 'Test User',
  password: 'Password1234',
};

// ¿Qué? Registra un usuario de prueba y retorna el body de la respuesta.
// ¿Para qué? Muchos tests necesitan un usuario pre-existente — esta función lo crea.
export async function createTestUser(
  overrides: Partial<typeof TEST_USER> = {},
): Promise<{ id: string; email: string; fullName: string }> {
  const userData = { ...TEST_USER, ...overrides };
  const res = await request(app).post('/api/v1/auth/register').send(userData);
  return res.body.data;
}

// ¿Qué? Registra y loguea un usuario de prueba, retornando los tokens.
// ¿Para qué? Los tests de rutas protegidas necesitan un access token válido.
export async function loginTestUser(
  credentials: Partial<{ email: string; password: string }> = {},
): Promise<{ accessToken: string; refreshToken: string }> {
  await createTestUser();
  const res = await request(app).post('/api/v1/auth/login').send({
    email: credentials.email ?? TEST_USER.email,
    password: credentials.password ?? TEST_USER.password,
  });
  return res.body.data;
}
