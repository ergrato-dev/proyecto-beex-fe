/**
 * Archivo: middlewares/auth.middleware.ts
 * Descripción: Middleware de verificación de JWT para rutas protegidas.
 * ¿Para qué? Proteger endpoints que requieren autenticación verificando el Bearer token.
 * ¿Impacto? Sin este middleware, cualquiera podría acceder a rutas privadas como
 *   GET /api/v1/users/me o POST /api/v1/auth/change-password.
 */

import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { UnauthorizedError } from './error.middleware.js';

// ¿Qué? El tipo de req.user está definido globalmente en src/types/express.d.ts.
// ¿Para qué? Usar module augmentation en vez de una interfaz separada evita
//   incompatibilidades de tipos con los overloads de Router de Express 5.

// ¿Qué? Payload esperado en el JWT.
interface TokenPayload {
  sub: string;   // user id
  email: string;
  type: 'access' | 'refresh';
}

// ¿Qué? Middleware que verifica el Bearer token del header Authorization.
// ¿Para qué? Autenticar requests y adjuntar el usuario al objeto req.
// ¿Impacto? Si el token es inválido o expirado, retorna 401 antes de llegar al controller.
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    next(new UnauthorizedError('Missing or invalid Authorization header'));
    return;
  }

  const token = authHeader.slice(7); // Remover "Bearer "

  try {
    const payload = jwt.verify(token, config.JWT_ACCESS_SECRET) as TokenPayload;

    if (payload.type !== 'access') {
      next(new UnauthorizedError('Invalid token type'));
      return;
    }

    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}
