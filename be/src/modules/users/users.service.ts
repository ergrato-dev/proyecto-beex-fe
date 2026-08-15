/**
 * Archivo: modules/users/users.service.ts
 * Descripción: Lógica de negocio para operaciones sobre el perfil de usuario.
 * ¿Para qué? Obtener y actualizar datos del usuario autenticado desde la BD de forma segura.
 * ¿Impacto? Solo expone y modifica datos propios — nunca datos de otros usuarios.
 */

import { db } from '../../db/index.js';
import { NotFoundError } from '../../middlewares/error.middleware.js';
import type { UpdateLocaleInput } from '../auth/auth.schema.js';

// ¿Qué? DTO de perfil de usuario — omite hashedPassword.
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  isEmailVerified: boolean;
  locale: string;
  createdAt: Date;
  updatedAt: Date | null;
}

// ¿Qué? Obtiene el perfil del usuario por su ID.
// ¿Para qué? Servir el endpoint GET /api/v1/users/me con datos propios del token.
// ¿Impacto? El ID siempre viene del token JWT — nunca de un parámetro de ruta controlable
//   por el cliente, lo que previene acceso horizontal no autorizado (IDOR).
export async function getUserById(userId: string): Promise<UserProfile> {
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new NotFoundError('Usuario no encontrado.');

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    locale: user.locale,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// ¿Qué? Actualiza el idioma preferido del usuario en la base de datos.
// ¿Para qué? Persistir la preferencia de locale ('es' | 'en') para que se restaure
//   al iniciar sesión desde cualquier dispositivo (RF-008, RNF-005.5).
// ¿Impacto? Si no se persiste en BD, el idioma se resetea al cambiar de dispositivo
//   o al borrar localStorage — mala experiencia de usuario.
export async function updateUserLocale(
  userId: string,
  data: UpdateLocaleInput,
): Promise<UserProfile> {
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new NotFoundError('Usuario no encontrado.');

  const updated = await db.user.update({
    where: { id: userId },
    data: { locale: data.locale, updatedAt: new Date() },
  });

  return {
    id: updated.id,
    email: updated.email,
    fullName: updated.fullName,
    isActive: updated.isActive,
    isEmailVerified: updated.isEmailVerified,
    locale: updated.locale,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  };
}
