/**
 * Archivo: tests/helpers.ts
 * Descripción: Helpers reutilizables para los tests del backend.
 * ¿Para qué? Evitar repetir código de setup en cada archivo de tests.
 * ¿Impacto? Centralizar la creación de datos de prueba facilita el mantenimiento.
 */

import crypto from 'node:crypto';
import { eq } from 'drizzle-orm';
import request from 'supertest';
import app from '../app.js';
import { db } from '../db/index.js';
import { users, emailVerificationTokens } from '../db/schema.js';

// ¿Qué? Datos de usuario válido para reutilizar en múltiples tests.
export const TEST_USER = {
  email: 'test@nn-company.com',
  fullName: 'Test User',
  password: 'Password1234',
};

// ¿Qué? Registra un usuario de prueba (email SIN verificar) y retorna el body.
// ¿Para qué? Tests que necesitan un usuario recién registrado antes de verificar email.
export async function createTestUser(
  overrides: Partial<typeof TEST_USER> = {},
): Promise<{ id: string; email: string; fullName: string }> {
  const userData = { ...TEST_USER, ...overrides };
  const res = await request(app).post('/api/v1/auth/register').send(userData);
  return res.body.data;
}

// ¿Qué? Registra un usuario y lo activa directamente en la BD (sin flujo de email).
// ¿Para qué? La mayoría de los tests necesitan un usuario listo para loguearse — este
//   helper evita tener que simular el envío/verificación de email en cada test.
// ¿Impacto? Método seguro para tests pues solo modifica la BD de pruebas aislada.
export async function createVerifiedTestUser(
  overrides: Partial<typeof TEST_USER> = {},
): Promise<{ id: string; email: string; fullName: string }> {
  const user = await createTestUser(overrides);
  // ¿Qué? Actualización directa en BD para simular la verificación de email.
  // ¿Para qué? Evitar dependencia del sistema de email en los tests de autenticación.
  await db.update(users).set({ isEmailVerified: true }).where(eq(users.id, user.id));
  return user;
}

// ¿Qué? Crea un token de verificación de email directamente en la BD de tests.
// ¿Para qué? Testear el endpoint POST /verify-email sin depender del envío de emails.
// ¿Impacto? Permite verificar que el endpoint funciona con tokens válidos, expirados y usados.
export async function createVerificationToken(
  userId?: string,
  options: { expiresIn?: number; used?: boolean } = {},
): Promise<{ userId: string; token: string }> {
  let id = userId;
  if (!id) {
    const user = await createTestUser();
    id = user.id;
  }

  const token = crypto.randomBytes(32).toString('hex');
  // ¿Qué? expiresIn en milisegundos — por defecto 24 horas; negativo = ya expirado.
  const expiresAt = new Date(Date.now() + (options.expiresIn ?? 24 * 60 * 60 * 1000));

  await db.insert(emailVerificationTokens).values({
    userId: id,
    token,
    expiresAt,
    used: options.used ?? false,
  });

  return { userId: id, token };
}

// ¿Qué? Registra, verifica y loguea un usuario de prueba, retornando los tokens.
// ¿Para qué? Los tests de rutas protegidas necesitan un access token válido.
// ¿Impacto? Ahora usa createVerifiedTestUser para evitar el 403 de email no verificado.
export async function loginTestUser(
  credentials: Partial<{ email: string; password: string }> = {},
): Promise<{ accessToken: string; refreshToken: string }> {
  await createVerifiedTestUser();
  const res = await request(app).post('/api/v1/auth/login').send({
    email: credentials.email ?? TEST_USER.email,
    password: credentials.password ?? TEST_USER.password,
  });
  return res.body.data;
}
