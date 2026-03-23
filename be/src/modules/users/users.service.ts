/**
 * Archivo: modules/users/users.service.ts
 * Descripción: Lógica de negocio para operaciones sobre el perfil de usuario.
 * ¿Para qué? Obtener datos del usuario autenticado desde la BD de forma segura.
 * ¿Impacto? Solo expone datos propios — nunca datos de otros usuarios.
 */

import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { users } from '../../db/schema.js';
import { NotFoundError } from '../../middlewares/error.middleware.js';

// ¿Qué? DTO de perfil de usuario — omite hashedPassword.
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}

// ¿Qué? Obtiene el perfil del usuario por su ID.
// ¿Para qué? Servir el endpoint GET /api/v1/users/me con datos propios del token.
// ¿Impacto? El ID siempre viene del token JWT — nunca de un parámetro de ruta controlable
//   por el cliente, lo que previene acceso horizontal no autorizado (IDOR).
export async function getUserById(userId: string): Promise<UserProfile> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) throw new NotFoundError('Usuario no encontrado.');

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
