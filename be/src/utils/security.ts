/**
 * Archivo: utils/security.ts
 * Descripción: Utilidades de seguridad — hashing de contraseñas y manejo de tokens JWT.
 * ¿Para qué? Centralizar las operaciones criptográficas en un módulo reutilizable.
 * ¿Impacto? Es la base de la seguridad del sistema. Un error aquí compromete toda
 *   la autenticación: contraseñas expuestas o tokens falseables.
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

const SALT_ROUNDS = 12;

// ¿Qué? Hashea una contraseña en texto plano con bcrypt.
// ¿Para qué? Almacenar contraseñas de forma segura — nunca en texto plano.
// ¿Impacto? Sin hashing, una filtración de la BD expone todas las contraseñas.
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// ¿Qué? Verifica si una contraseña coincide con su hash almacenado.
// ¿Para qué? Validar las credenciales durante el login.
// ¿Impacto? Si falla, nadie puede autenticarse; si es insegura, permite acceso no autorizado.
export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

// ¿Qué? Genera un access token JWT con corta duración (15 min).
// ¿Para qué? Autenticar requests a rutas protegidas sin consultar la BD en cada request.
// ¿Impacto? Si el secret es débil o el token dura demasiado, aumenta la ventana de exposición.
export function generateAccessToken(userId: string, email: string): string {
  return jwt.sign(
    { sub: userId, email, type: 'access' },
    config.JWT_ACCESS_SECRET,
    { expiresIn: config.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'] },
  );
}

// ¿Qué? Genera un refresh token JWT con larga duración (7 días).
// ¿Para qué? Renovar el access token sin requerir re-autenticación del usuario.
// ¿Impacto? Si es robado, permite acceso prolongado — debe manejarse con cuidado.
export function generateRefreshToken(userId: string, email: string): string {
  return jwt.sign(
    { sub: userId, email, type: 'refresh' },
    config.JWT_REFRESH_SECRET,
    { expiresIn: config.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] },
  );
}

// ¿Qué? Verifica y decodifica un refresh token.
// ¿Para qué? Validar el token en el endpoint POST /api/v1/auth/refresh.
export function verifyRefreshToken(token: string): { sub: string; email: string } {
  const payload = jwt.verify(token, config.JWT_REFRESH_SECRET) as {
    sub: string;
    email: string;
    type: string;
  };

  if (payload.type !== 'refresh') {
    throw new Error('Invalid token type');
  }

  return { sub: payload.sub, email: payload.email };
}
