/**
 * Archivo: tests/auth.test.ts
 * Descripción: Tests de integración para todos los endpoints de autenticación.
 * ¿Para qué? Verificar que el flujo completo de auth funciona correctamente:
 *   registro, login, refresh, cambio de contraseña, recuperación y reset.
 * ¿Impacto? Si estos tests no cubren los happy paths y los casos de error,
 *   podemos desplegar código roto sin saberlo.
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import {
  createTestUser,
  createVerifiedTestUser,
  createVerificationToken,
  loginTestUser,
  TEST_USER,
} from './helpers.js';

// ---------------------------------------------------------------------------
// POST /api/v1/auth/register
// ---------------------------------------------------------------------------
describe('POST /api/v1/auth/register', () => {
  // ¿Qué? Caso exitoso — usuario nuevo con datos válidos.
  it('should register a new user and return 201', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(TEST_USER);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    // ¿Para qué? Verificar que la respuesta no contiene la contraseña.
    expect(res.body.data).not.toHaveProperty('hashedPassword');
    expect(res.body.data).not.toHaveProperty('password');
    expect(res.body.data.email).toBe(TEST_USER.email);
  });

  // ¿Qué? Email duplicado — el mismo email no se puede registrar dos veces.
  it('should return 409 if email is already registered', async () => {
    await createTestUser();
    const res = await request(app).post('/api/v1/auth/register').send(TEST_USER);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  // ¿Qué? Email inválido — el schema zod debe rechazarlo.
  it('should return 422 with invalid email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...TEST_USER, email: 'not-an-email' });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  // ¿Qué? Contraseña débil — no cumple la política de seguridad.
  it('should return 422 with weak password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...TEST_USER, password: '12345678' });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  // ¿Qué? Body vacío — el middleware validate debe rechazarlo.
  it('should return 422 with empty body', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({});

    expect(res.status).toBe(422);
  });
});

// ---------------------------------------------------------------------------
// POST /api/v1/auth/login
// ---------------------------------------------------------------------------
describe('POST /api/v1/auth/login', () => {
  // ¿Qué? Login exitoso — usuario con email verificado retorna access + refresh token.
  it('should login and return tokens on valid credentials', async () => {
    await createVerifiedTestUser();
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
    expect(res.body.data.tokenType).toBe('bearer');
  });

  // ¿Qué? Login bloqueado si el email no ha sido verificado (RF-002 RN-023).
  // ¿Para qué? Garantizar que solo usuarios que poseen el email pueden acceder.
  it('should return 403 when email is not verified', async () => {
    await createTestUser(); // usuario sin verificar
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // ¿Qué? Contraseña incorrecta — debe retornar 401 (mensaje genérico).
  it('should return 401 with wrong password', async () => {
    await createVerifiedTestUser();
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_USER.email, password: 'WrongPass99' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // ¿Qué? Email no registrado — mensaje genérico (no revelar si existe).
  it('should return 401 with non-existent email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'noexiste@nn-company.com', password: TEST_USER.password });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // ¿Qué? Body sin contraseña — validación zod.
  it('should return 422 with missing password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_USER.email });

    expect(res.status).toBe(422);
  });
});

// ---------------------------------------------------------------------------
// POST /api/v1/auth/refresh
// ---------------------------------------------------------------------------
describe('POST /api/v1/auth/refresh', () => {
  // ¿Qué? Refresh exitoso — retorna nuevo access token usando refresh token válido.
  it('should return a new access token with valid refresh token', async () => {
    const { refreshToken } = await loginTestUser();
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
  });

  // ¿Qué? Refresh token inválido — JWT malformado.
  it('should return 401 with an invalid refresh token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'this.is.not.a.valid.jwt' });

    expect(res.status).toBe(401);
  });

  // ¿Qué? Body vacío.
  it('should return 422 with missing refreshToken field', async () => {
    const res = await request(app).post('/api/v1/auth/refresh').send({});

    expect(res.status).toBe(422);
  });
});

// ---------------------------------------------------------------------------
// POST /api/v1/auth/change-password
// ---------------------------------------------------------------------------
describe('POST /api/v1/auth/change-password', () => {
  // ¿Qué? Cambio exitoso — usuario autenticado con contraseña actual correcta.
  it('should change password when authenticated and current password is correct', async () => {
    const { accessToken } = await loginTestUser();
    const res = await request(app)
      .post('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentPassword: TEST_USER.password, newPassword: 'NewPassword99' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // ¿Qué? Contraseña actual incorrecta.
  it('should return 401 when current password is wrong', async () => {
    const { accessToken } = await loginTestUser();
    const res = await request(app)
      .post('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentPassword: 'WrongCurrent1', newPassword: 'NewPassword99' });

    expect(res.status).toBe(401);
  });

  // ¿Qué? Sin token de autorización — debe retornar 401.
  it('should return 401 when no Authorization header is provided', async () => {
    const res = await request(app)
      .post('/api/v1/auth/change-password')
      .send({ currentPassword: TEST_USER.password, newPassword: 'NewPassword99' });

    expect(res.status).toBe(401);
  });

  // ¿Qué? Nueva contraseña igual a la actual — el schema la rechaza.
  it('should return 422 when new password equals current password', async () => {
    const { accessToken } = await loginTestUser();
    const res = await request(app)
      .post('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentPassword: TEST_USER.password, newPassword: TEST_USER.password });

    expect(res.status).toBe(422);
  });
});

// ---------------------------------------------------------------------------
// POST /api/v1/auth/forgot-password
// ---------------------------------------------------------------------------
describe('POST /api/v1/auth/forgot-password', () => {
  // ¿Qué? Email registrado — retorna 200 con mensaje genérico.
  // ¿Para qué? Nunca revelar si el email existe en el sistema (enumeración de usuarios).
  it('should return 200 for a registered email without revealing its existence', async () => {
    await createTestUser();
    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: TEST_USER.email });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // ¿Qué? Email NO registrado — también retorna 200 (mismo mensaje genérico).
  it('should return 200 even for an unregistered email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'noexiste@nn-company.com' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // ¿Qué? Email inválido — validación zod.
  it('should return 422 with invalid email format', async () => {
    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'bad-email' });

    expect(res.status).toBe(422);
  });
});

// ---------------------------------------------------------------------------
// POST /api/v1/auth/reset-password
// ---------------------------------------------------------------------------
describe('POST /api/v1/auth/reset-password', () => {
  // ¿Qué? Token inválido / inexistente — no se puede restablecer la contraseña.
  it('should return 400 with an invalid reset token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: 'invalid-token-that-does-not-exist', newPassword: 'NewPass99' });

    // 400 Bad Request — token no encontrado o expirado
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // ¿Qué? Body sin token — validación zod.
  it('should return 422 with missing token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ newPassword: 'NewPass99' });

    expect(res.status).toBe(422);
  });

  // ¿Qué? Nueva contraseña débil — validación zod.
  it('should return 422 with weak new password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: 'some-token', newPassword: 'weak' });

    expect(res.status).toBe(422);
  });
});

// ---------------------------------------------------------------------------
// GET /api/v1/users/me
// ---------------------------------------------------------------------------
describe('GET /api/v1/users/me', () => {
  // ¿Qué? Usuario autenticado — retorna su perfil con los campos nuevos.
  it('should return the current user profile when authenticated', async () => {
    const { accessToken } = await loginTestUser();
    const res = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(TEST_USER.email);
    expect(res.body.data).not.toHaveProperty('hashedPassword');
    // ¿Qué? isEmailVerified y locale deben estar presentes en el perfil (RF-007).
    expect(res.body.data).toHaveProperty('isEmailVerified', true);
    expect(res.body.data).toHaveProperty('locale', 'es');
  });

  // ¿Qué? Sin Authorization header — debe retornar 401.
  it('should return 401 when no token is provided', async () => {
    const res = await request(app).get('/api/v1/users/me');

    expect(res.status).toBe(401);
  });

  // ¿Qué? Token malformado — el middleware debe rechazarlo.
  it('should return 401 with malformed Bearer token', async () => {
    const res = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', 'Bearer not.a.real.token');

    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// POST /api/v1/auth/verify-email
// ---------------------------------------------------------------------------
describe('POST /api/v1/auth/verify-email', () => {
  // ¿Qué? Token válido — activa la cuenta y retorna 200.
  it('should verify email and activate account with a valid token', async () => {
    const { token } = await createVerificationToken();
    const res = await request(app)
      .post('/api/v1/auth/verify-email')
      .send({ token });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/verificado/i);
  });

  // ¿Qué? Tras verificar, el usuario puede loguearse correctamente.
  it('should allow login after email verification', async () => {
    const { token } = await createVerificationToken();
    await request(app).post('/api/v1/auth/verify-email').send({ token });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('accessToken');
  });

  // ¿Qué? Token inexistente — debe retornar 400.
  it('should return 400 with a non-existent token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/verify-email')
      .send({ token: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // ¿Qué? Token ya usado — debe retornar 400.
  it('should return 400 when token has already been used', async () => {
    const { token } = await createVerificationToken(undefined, { used: true });
    const res = await request(app)
      .post('/api/v1/auth/verify-email')
      .send({ token });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // ¿Qué? Token expirado — debe retornar 400.
  it('should return 400 when token is expired', async () => {
    // expiresIn negativo = ya expiró
    const { token } = await createVerificationToken(undefined, { expiresIn: -1000 });
    const res = await request(app)
      .post('/api/v1/auth/verify-email')
      .send({ token });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // ¿Qué? Body vacío — validación zod.
  it('should return 422 with missing token field', async () => {
    const res = await request(app)
      .post('/api/v1/auth/verify-email')
      .send({});

    expect(res.status).toBe(422);
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/v1/users/me/locale
// ---------------------------------------------------------------------------
describe('PATCH /api/v1/users/me/locale', () => {
  // ¿Qué? Cambia el locale a 'en' — debe persistir y retornar el perfil actualizado.
  it('should update locale to "en" and return updated profile', async () => {
    const { accessToken } = await loginTestUser();
    const res = await request(app)
      .patch('/api/v1/users/me/locale')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ locale: 'en' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.locale).toBe('en');
  });

  // ¿Qué? Cambia el locale a 'es' — el idioma por defecto también debe ser válido.
  it('should update locale to "es"', async () => {
    const { accessToken } = await loginTestUser();
    const res = await request(app)
      .patch('/api/v1/users/me/locale')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ locale: 'es' });

    expect(res.status).toBe(200);
    expect(res.body.data.locale).toBe('es');
  });

  // ¿Qué? Locale no soportado — el schema zod rechaza valores fuera de ['es', 'en'].
  it('should return 422 with an unsupported locale', async () => {
    const { accessToken } = await loginTestUser();
    const res = await request(app)
      .patch('/api/v1/users/me/locale')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ locale: 'fr' });

    expect(res.status).toBe(422);
  });

  // ¿Qué? Sin Authorization — requiere auth igual que todos los endpoints de usuario.
  it('should return 401 when not authenticated', async () => {
    const res = await request(app)
      .patch('/api/v1/users/me/locale')
      .send({ locale: 'en' });

    expect(res.status).toBe(401);
  });

  // ¿Qué? Body vacío — el campo locale es requerido.
  it('should return 422 with missing locale field', async () => {
    const { accessToken } = await loginTestUser();
    const res = await request(app)
      .patch('/api/v1/users/me/locale')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({});

    expect(res.status).toBe(422);
  });
});
