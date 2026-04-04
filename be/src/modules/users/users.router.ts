/**
 * Archivo: modules/users/users.router.ts
 * Descripción: Router de Express para los endpoints de usuario.
 * ¿Para qué? Exponer GET /me protegido con autenticación JWT.
 * ¿Impacto? Sin el middleware authenticate cualquiera podría acceder al perfil.
 */

import { Router, type IRouter } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import * as usersController from './users.controller.js';

const router: IRouter = Router();

// GET /api/v1/users/me — Obtener perfil del usuario autenticado
// authenticate es obligatorio aquí — userId viene del token
router.get('/me', authenticate, usersController.getMe);

export default router;
