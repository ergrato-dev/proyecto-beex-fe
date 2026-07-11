/**
 * Archivo: modules/auth/auth.controller.ts
 * Descripción: Handlers HTTP para los endpoints de autenticación.
 * ¿Para qué? Capa delgada que extrae datos del request, llama al service y formatea
 *   el response. No contiene lógica de negocio.
 * ¿Impacto? Un controller gordo mezcla responsabilidades y dificulta el testing.
 */

import type { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service.js';
import type {
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from './auth.schema.js';

// ¿Qué? Registra un nuevo usuario.
// ¿Para qué? Delega al service y retorna 201 con el usuario creado.
export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await authService.registerUser(req.body as RegisterInput);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

// ¿Qué? Inicia sesión y entrega access + refresh token.
// ¿Para qué? La IP del cliente se pasa al service para el audit log de seguridad.
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // ¿Qué? req.ip puede ser undefined en Express 5 — se usa 'unknown' como fallback seguro.
    const ip = req.ip ?? 'unknown';
    const tokens = await authService.loginUser(req.body as LoginInput, ip);
    res.status(200).json({ success: true, data: tokens });
  } catch (err) {
    next(err);
  }
}

// ¿Qué? Renueva el access token a partir de un refresh token válido.
export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tokens = await authService.refreshTokens(req.body as RefreshTokenInput);
    res.status(200).json({ success: true, data: tokens });
  } catch (err) {
    next(err);
  }
}

// ¿Qué? Cambia la contraseña del usuario autenticado.
// ¿Para qué? El userId se toma del token JWT (req.user) — nunca del body.
export async function changePassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await authService.changeUserPassword(req.user!.id, req.body as ChangePasswordInput);
    res.status(200).json({ success: true, message: 'Contraseña actualizada correctamente.' });
  } catch (err) {
    next(err);
  }
}

// ¿Qué? Inicia el flujo de recuperación enviando el email con el token.
// ¿Para qué? Siempre responde 200 para no revelar si el email existe.
export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await authService.requestPasswordReset(req.body as ForgotPasswordInput);
    res.status(200).json({
      success: true,
      message: 'Si el email existe recibirás un enlace de recuperación en breve.',
    });
  } catch (err) {
    next(err);
  }
}

// ¿Qué? Restablece la contraseña usando el token de recuperación.
export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await authService.resetUserPassword(req.body as ResetPasswordInput);
    res.status(200).json({ success: true, message: 'Contraseña restablecida correctamente.' });
  } catch (err) {
    next(err);
  }
}

// ¿Qué? Verifica el email del usuario usando el token del enlace de activación.
// ¿Para qué? Completar el flujo de registro: activar la cuenta para permitir el login.
// ¿Impacto? Hasta que este endpoint sea llamado con un token válido, el login retorna 403.
export async function verifyEmail(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await authService.verifyEmail(req.body as VerifyEmailInput);
    res.status(200).json({
      success: true,
      message: 'Email verificado correctamente. Ya puedes iniciar sesión.',
    });
  } catch (err) {
    next(err);
  }
}
