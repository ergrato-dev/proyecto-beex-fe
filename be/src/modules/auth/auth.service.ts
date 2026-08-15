/**
 * Archivo: modules/auth/auth.service.ts
 * Descripción: Lógica de negocio para todos los flujos de autenticación.
 * ¿Para qué? Separar la lógica de negocio de los handlers HTTP — el controller
 *   solo delega, este módulo decide qué hacer.
 * ¿Impacto? Es el corazón del sistema auth; errores aquí afectan seguridad y datos.
 */

import crypto from 'node:crypto';
import type { User } from '@prisma/client';
import { db } from '../../db/index.js';
import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  DUMMY_PASSWORD_HASH,
} from '../../utils/security.js';
import { sendPasswordResetEmail, sendVerificationEmail } from '../../utils/email.js';
import {
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  BadRequestError,
} from '../../middlewares/error.middleware.js';
import {
  logLoginSuccess,
  logLoginFailed,
  logPasswordChanged,
  logPasswordResetRequested,
  logEmailVerified,
} from '../../utils/audit-log.js';
import type {
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyEmailInput,
  UpdateLocaleInput,
} from './auth.schema.js';

// ¿Qué? Tipo de respuesta de usuario — nunca expone hashedPassword.
// ¿Para qué? Garantizar que la contraseña nunca viaje en el response.
export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  isEmailVerified: boolean;
  locale: string;
  createdAt: Date;
}

// ¿Qué? Tipo de respuesta de tokens — access + refresh.
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: 'bearer';
}

// ¿Qué? Mapea un usuario de BD al DTO de respuesta, omitiendo la contraseña.
function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    locale: user.locale,
    createdAt: user.createdAt,
  };
}

// ¿Qué? Registra un nuevo usuario con contraseña hasheada y envía email de verificación.
// ¿Para qué? Crear cuentas verificando unicidad de email, almacenando hash seguro e
//   iniciando el flujo de verificación de email para activar la cuenta.
// ¿Impacto? Sin verificación de duplicados, múltiples cuentas con el mismo email
//   generarían conflictos de datos. Sin verificación de email, cualquiera podría
//   registrarse con el email de otra persona.
export async function registerUser(data: RegisterInput): Promise<UserResponse> {
  const existing = await db.user.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    // ¿Qué? Mensaje genérico — no confirmar si el email existe (OWASP A07).
    throw new ConflictError('El email ya está registrado.');
  }

  const hashed = await hashPassword(data.password);

  const user = await db.user.create({
    data: {
      email: data.email,
      fullName: data.fullName,
      hashedPassword: hashed,
    },
  });

  // ¿Qué? Token criptográficamente seguro de 32 bytes (64 chars hex) para verificación de email.
  // ¿Para qué? Garantizar que solo quien tiene acceso al email puede activar la cuenta.
  // ¿Impacto? Expira en 24 horas — si no se verifica, la cuenta queda inactiva (isEmailVerified=false).
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db.emailVerificationToken.create({
    data: {
      userId: user.id,
      token: verificationToken,
      expiresAt,
    },
  });

  await sendVerificationEmail(user.email, verificationToken);

  return toUserResponse(user);
}

// ¿Qué? Autentica un usuario con email + contraseña y genera ambos tokens.
// ¿Para qué? Punto de entrada al sistema — retorna tokens para sesiones autenticadas.
// ¿Impacto? Un error en la comparación de hash permitiría logins incorrectos.
export async function loginUser(data: LoginInput, ip?: string): Promise<TokenResponse> {
  const user = await db.user.findUnique({
    where: { email: data.email },
  });

  // ¿Qué? Mensaje de error idéntico tanto para email inexistente como contraseña incorrecta.
  // ¿Para qué? Prevenir user enumeration attacks (OWASP A07). Si el usuario no existe,
  //   igual se corre bcrypt contra DUMMY_PASSWORD_HASH — si no, el tiempo de respuesta
  //   sigue delatando qué emails existen aunque el mensaje sea genérico (timing attack).
  const isPasswordValid = await verifyPassword(data.password, user?.hashedPassword ?? DUMMY_PASSWORD_HASH);
  if (!user || !isPasswordValid) {
    logLoginFailed('Credenciales inválidas', ip);
    throw new UnauthorizedError('Credenciales inválidas.');
  }

  if (!user.isActive) {
    logLoginFailed('Cuenta desactivada', ip);
    throw new UnauthorizedError('La cuenta está desactivada.');
  }

  // ¿Qué? Bloquea el login si el email no ha sido verificado (403 Forbidden).
  // ¿Para qué? Garantizar que el usuario es el propietario del email antes de darle acceso.
  // ¿Impacto? Sin esta verificación, un atacante podría registrarse con el email de otra persona
  //   y obtener acceso al sistema antes de que el dueño real reaccione.
  if (!user.isEmailVerified) {
    throw new ForbiddenError('Debes verificar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.');
  }

  logLoginSuccess(user.id, ip ?? 'unknown');

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

  const user = await db.user.findUnique({
    where: { id: payload.sub },
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
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new NotFoundError('Usuario no encontrado.');

  const valid = await verifyPassword(data.currentPassword, user.hashedPassword);
  if (!valid) throw new UnauthorizedError('La contraseña actual es incorrecta.');

  const hashed = await hashPassword(data.newPassword);

  await db.user.update({
    where: { id: userId },
    data: { hashedPassword: hashed, updatedAt: new Date() },
  });

  logPasswordChanged(userId);
}

// ¿Qué? Genera un token de recuperación y envía el email al usuario.
// ¿Para qué? Iniciar el flujo de reset de contraseña de forma segura.
// ¿Impacto? El response siempre es genérico — no revelar si el email existe (OWASP A07).
export async function requestPasswordReset(data: ForgotPasswordInput): Promise<void> {
  const user = await db.user.findUnique({
    where: { email: data.email },
  });

  // ¿Qué? Respuesta silenciosa si el email no existe.
  // ¿Para qué? Prevenir user enumeration — el cliente siempre ve el mismo mensaje.
  if (!user || !user.isActive) return;

  // ¿Qué? Token criptográficamente seguro de 32 bytes (64 chars hex).
  const resetToken = crypto.randomBytes(32).toString('hex');

  // ¿Qué? Expira en 1 hora.
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await db.passwordResetToken.create({
    data: {
      userId: user.id,
      token: resetToken,
      expiresAt,
    },
  });

  await sendPasswordResetEmail(user.email, resetToken);
  logPasswordResetRequested();
}

// ¿Qué? Valida el token de reset y actualiza la contraseña del usuario.
// ¿Para qué? Completar el flujo de recuperación con verificación segura del token.
// ¿Impacto? El token debe ser único, no expirado y no usado — cualquier fallo es 400.
export async function resetUserPassword(data: ResetPasswordInput): Promise<void> {
  const tokenRecord = await db.passwordResetToken.findFirst({
    where: {
      token: data.token,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!tokenRecord) {
    throw new BadRequestError('El token es inválido o ha expirado.');
  }

  const hashed = await hashPassword(data.newPassword);

  // ¿Qué? Actualizar contraseña y marcar token como usado en una sola transacción real.
  // ¿Para qué? Garantizar atomicidad — si una de las dos escrituras falla, ninguna se aplica.
  // ¿Impacto? Antes (con Drizzle) estas eran dos escrituras secuenciales sin transacción real
  //   pese a que el comentario original lo afirmaba — `$transaction` cierra ese gap.
  await db.$transaction([
    db.user.update({
      where: { id: tokenRecord.userId },
      data: { hashedPassword: hashed, updatedAt: new Date() },
    }),
    db.passwordResetToken.update({
      where: { id: tokenRecord.id },
      data: { used: true },
    }),
  ]);
}

// ¿Qué? Verifica el email del usuario usando el token enviado al momento del registro.
// ¿Para qué? Confirmar que el usuario es el propietario del email y activar su cuenta
//   para que pueda iniciar sesión (RF-003).
// ¿Impacto? Sin esta verificación, el login queda bloqueado con 403 indefinidamente.
//   El token es de un solo uso — una vez consumido, no puede reutilizarse.
export async function verifyEmail(data: VerifyEmailInput): Promise<void> {
  const tokenRecord = await db.emailVerificationToken.findFirst({
    where: {
      token: data.token,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!tokenRecord) {
    throw new BadRequestError('El token de verificación es inválido o ha expirado.');
  }

  // ¿Qué? Actualiza isEmailVerified=true y marca el token como usado, en una transacción real.
  // ¿Para qué? Activar la cuenta y asegurar que el token no pueda usarse de nuevo de forma atómica.
  await db.$transaction([
    db.user.update({
      where: { id: tokenRecord.userId },
      data: { isEmailVerified: true, updatedAt: new Date() },
    }),
    db.emailVerificationToken.update({
      where: { id: tokenRecord.id },
      data: { used: true },
    }),
  ]);

  logEmailVerified(tokenRecord.userId);
}

// ¿Qué? Actualiza el idioma preferido del usuario en la base de datos.
// ¿Para qué? Persistir la preferencia de idioma ('es' | 'en') para que se restaure
//   al iniciar sesión desde otro dispositivo (RF-008, RNF-005.5).
// ¿Impacto? Si no se persiste, el cambio de idioma solo vive en localStorage
//   y se pierde al cambiar de dispositivo.
export async function updateUserLocale(
  userId: string,
  data: UpdateLocaleInput,
): Promise<UserResponse> {
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new NotFoundError('Usuario no encontrado.');

  const updated = await db.user.update({
    where: { id: userId },
    data: { locale: data.locale, updatedAt: new Date() },
  });

  return toUserResponse(updated);
}
