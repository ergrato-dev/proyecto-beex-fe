/**
 * Archivo: modules/users/users.controller.ts
 * Descripción: Handlers HTTP para los endpoints de usuario.
 * ¿Para qué? Capa delgada entre el router y el service — extrae user.id del token JWT.
 * ¿Impacto? El userId SIEMPRE viene de req.user (token), nunca de req.params o req.body.
 */

import type { Request, Response, NextFunction } from 'express';
import * as usersService from './users.service.js';
import type { UpdateLocaleInput } from '../auth/auth.schema.js';

// ¿Qué? Retorna el perfil del usuario actualmente autenticado.
// ¿Para qué? Permitir al frontend mostrar datos del usuario sin exponer otros perfiles.
export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const profile = await usersService.getUserById(req.user!.id);
    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}

// ¿Qué? Actualiza el idioma preferido del usuario autenticado.
// ¿Para qué? Persistir el locale ('es' | 'en') en BD para sincronización multi-dispositivo.
// ¿Impacto? El userId siempre viene del JWT — el usuario solo puede cambiar su propio locale.
export async function updateLocale(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const profile = await usersService.updateUserLocale(
      req.user!.id,
      req.body as UpdateLocaleInput,
    );
    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}
