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

// ¿Qué? Extensión del tipo Request para incluir el usuario autenticado.
// ¿Para qué? Tener acceso a req.user en los controllers de rutas protegidas.
export interface AuthRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

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

    (req as AuthRequest).user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}
