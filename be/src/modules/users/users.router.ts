/**
 * Archivo: modules/users/users.router.ts
 * Descripción: Router de Express para los endpoints de usuario.
 * ¿Para qué? Exponer GET /me y PATCH /me/locale protegidos con autenticación JWT.
 * ¿Impacto? Sin el middleware authenticate cualquiera podría acceder o modificar perfiles.
 */

import { Router, type IRouter } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { updateLocaleSchema } from '../auth/auth.schema.js';
import * as usersController from './users.controller.js';

const router: IRouter = Router();

// GET /api/v1/users/me — Obtener perfil del usuario autenticado
// authenticate es obligatorio aquí — userId viene del token
router.get('/me', authenticate, usersController.getMe);

// PATCH /api/v1/users/me/locale — Actualizar el idioma preferido del usuario
// ¿Qué? Valida que locale sea 'es' o 'en', luego persiste en BD.
// ¿Para qué? Sincronizar la preferencia de idioma entre dispositivos del mismo usuario.
router.patch('/me/locale', authenticate, validate(updateLocaleSchema), usersController.updateLocale);

export default router;
