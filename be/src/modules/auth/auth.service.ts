/**
 * Archivo: modules/auth/auth.service.ts
 * Descripción: Lógica de negocio para todos los flujos de autenticación.
 * ¿Para qué? Separar la lógica de negocio de los handlers HTTP — el controller
 *   solo delega, este módulo decide qué hacer.
 * ¿Impacto? Es el corazón del sistema auth; errores aquí afectan seguridad y datos.
 */

import crypto from 'node:crypto';
import { eq, and, gt } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { users, passwordResetTokens } from '../../db/schema.js';
import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../utils/security.js';
import { sendPasswordResetEmail } from '../../utils/email.js';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
} from '../../middlewares/error.middleware.js';
import type {
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from './auth.schema.js';

// ¿Qué? Tipo de respuesta de usuario — nunca expone hashedPassword.
// ¿Para qué? Garantizar que la contraseña nunca viaje en el response.
export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  createdAt: Date;
}

// ¿Qué? Tipo de respuesta de tokens — access + refresh.
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: 'bearer';
}

// ¿Qué? Mapea un usuario de BD al DTO de respuesta, omitiendo la contraseña.
function toUserResponse(user: typeof users.$inferSelect): UserResponse {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

// ¿Qué? Registra un nuevo usuario con contraseña hasheada.
// ¿Para qué? Crear cuentas verificando unicidad de email y almacenando hash seguro.
// ¿Impacto? Sin verificación de duplicados, múltiples cuentas con el mismo email generarían
//   conflictos de datos y problemas de acceso.
export async function registerUser(data: RegisterInput): Promise<UserResponse> {
  const existing = await db.query.users.findFirst({
    where: eq(users.email, data.email),
  });

  if (existing) {
    // ¿Qué? Mensaje genérico — no confirmar si el email existe (OWASP A07).
    throw new ConflictError('El email ya está registrado.');
  }

  const hashed = await hashPassword(data.password);

  const [user] = await db
    .insert(users)
    .values({
      email: data.email,
      fullName: data.fullName,
      hashedPassword: hashed,
    })
    .returning();

  return toUserResponse(user);
}

// ¿Qué? Autentica un usuario con email + contraseña y genera ambos tokens.
// ¿Para qué? Punto de entrada al sistema — retorna tokens para sesiones autenticadas.
// ¿Impacto? Un error en la comparación de hash permitiría logins incorrectos.
export async function loginUser(data: LoginInput): Promise<TokenResponse> {
  const user = await db.query.users.findFirst({
    where: eq(users.email, data.email),
  });

  // ¿Qué? Mensaje de error idéntico tanto para email inexistente como contraseña incorrecta.
  // ¿Para qué? Prevenir user enumeration attacks (OWASP A07).
  if (!user || !(await verifyPassword(data.password, user.hashedPassword))) {
    throw new UnauthorizedError('Credenciales inválidas.');
  }

  if (!user.isActive) {
    throw new UnauthorizedError('La cuenta está desactivada.');
  }

  return {
    accessToken: generateAccessToken(user.id, user.email),
    refreshToken: generateRefreshToken(user.id, user.email),
    tokenType: 'bearer',
  };
}

// ¿Qué? Renueva el access token usando un refresh token válido.
// ¿Para qué? Permitir sesiones largas sin requerir re-login cada 15 minutos.
// ¿Impacto? Un refresh token inválido o expirado debe retornar 401 claramente.
export async function refreshTokens(data: RefreshTokenInput): Promise<TokenResponse> {
  let payload: { sub: string; email: string };
  try {
    payload = verifyRefreshToken(data.refreshToken);
  } catch {
    throw new UnauthorizedError('Refresh token inválido o expirado.');
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, payload.sub),
  });

  if (!user || !user.isActive) {
    throw new UnauthorizedError('Usuario no encontrado o inactivo.');
  }

  return {
    accessToken: generateAccessToken(user.id, user.email),
    refreshToken: generateRefreshToken(user.id, user.email),
    tokenType: 'bearer',
  };
}

// ¿Qué? Cambia la contraseña de un usuario autenticado.
// ¿Para qué? Permitir al usuario actualizar su contraseña conociendo la actual.
// ¿Impacto? Se debe verificar la contraseña actual para prevenir cambios no autorizados.
export async function changeUserPassword(
  userId: string,
  data: ChangePasswordInput,
): Promise<void> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) throw new NotFoundError('Usuario no encontrado.');

  const valid = await verifyPassword(data.currentPassword, user.hashedPassword);
  if (!valid) throw new UnauthorizedError('La contraseña actual es incorrecta.');

  const hashed = await hashPassword(data.newPassword);

  await db
    .update(users)
    .set({ hashedPassword: hashed, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

// ¿Qué? Genera un token de recuperación y envía el email al usuario.
// ¿Para qué? Iniciar el flujo de reset de contraseña de forma segura.
// ¿Impacto? El response siempre es genérico — no revelar si el email existe (OWASP A07).
export async function requestPasswordReset(data: ForgotPasswordInput): Promise<void> {
  const user = await db.query.users.findFirst({
    where: eq(users.email, data.email),
  });

  // ¿Qué? Respuesta silenciosa si el email no existe.
  // ¿Para qué? Prevenir user enumeration — el cliente siempre ve el mismo mensaje.
  if (!user || !user.isActive) return;

  // ¿Qué? Token criptográficamente seguro de 32 bytes (64 chars hex).
  const resetToken = crypto.randomBytes(32).toString('hex');

  // ¿Qué? Expira en 1 hora.
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await db.insert(passwordResetTokens).values({
    userId: user.id,
    token: resetToken,
    expiresAt,
  });

  await sendPasswordResetEmail(user.email, resetToken);
}

// ¿Qué? Valida el token de reset y actualiza la contraseña del usuario.
// ¿Para qué? Completar el flujo de recuperación con verificación segura del token.
// ¿Impacto? El token debe ser único, no expirado y no usado — cualquier fallo es 400.
export async function resetUserPassword(data: ResetPasswordInput): Promise<void> {
  const tokenRecord = await db.query.passwordResetTokens.findFirst({
    where: and(
      eq(passwordResetTokens.token, data.token),
      eq(passwordResetTokens.used, false),
      gt(passwordResetTokens.expiresAt, new Date()),
    ),
    with: { user: true },
  });

  if (!tokenRecord) {
    throw new ValidationError('El token es inválido o ha expirado.');
  }

  const hashed = await hashPassword(data.newPassword);

  // ¿Qué? Actualizar contraseña y marcar token como usado en una sola transacción lógica.
  await db
    .update(users)
    .set({ hashedPassword: hashed, updatedAt: new Date() })
    .where(eq(users.id, tokenRecord.userId));

  await db
    .update(passwordResetTokens)
    .set({ used: true })
    .where(eq(passwordResetTokens.id, tokenRecord.id));
}
