/**
 * Archivo: modules/auth/auth.router.ts
 * Descripción: Router de Express para los endpoints de autenticación.
 * ¿Para qué? Conectar las rutas con sus controladores y middlewares de validación/auth.
 * ¿Impacto? Una ruta mal configurada puede exponer endpoints sin validación o sin auth.
 */

import { Router, type IRouter } from 'express';
import * as authController from './auth.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from './auth.schema.js';

const router: IRouter = Router();

// POST /api/v1/auth/register — Registro de nuevo usuario
// validate(registerSchema) garantiza que el body sea correcto antes de llegar al controller
router.post('/register', validate(registerSchema), authController.register);

// POST /api/v1/auth/login — Login con email + contraseña
router.post('/login', validate(loginSchema), authController.login);

// POST /api/v1/auth/refresh — Renovar access token con refresh token
router.post('/refresh', validate(refreshTokenSchema), authController.refresh);

// POST /api/v1/auth/change-password — Cambiar contraseña (requiere auth)
// authenticate verifica el JWT antes de llegar al controller
router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword,
);

// POST /api/v1/auth/forgot-password — Solicitar email de recuperación
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);

// POST /api/v1/auth/reset-password — Restablecer contraseña con token
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

// POST /api/v1/auth/verify-email — Verificar email con token de activación
// ¿Qué? Solo requiere el token del enlace — no necesita JWT (el usuario aún no puede loguearse).
// ¿Para qué? Activar la cuenta para que el usuario pueda iniciar sesión.
router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);

export default router;
