/**
 * Archivo: middlewares/error.middleware.ts
 * Descripción: Manejador global de errores para Express.
 * ¿Para qué? Centralizar el manejo de errores — controllers y services solo lanzan
 *   errores tipados, este middleware los transforma en respuestas HTTP consistentes.
 * ¿Impacto? Sin este middleware, los errores no manejados causarían crashes o
 *   respuestas vacías con status 500 sin información útil.
 */

import type { Request, Response, NextFunction } from 'express';

// ¿Qué? Clase base para errores de la aplicación con código HTTP y código interno.
// ¿Para qué? Distinguir errores esperados (negocio) de errores inesperados (bugs).
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

// ¿Qué? 422 Unprocessable Entity es el status semánticamente correcto para errores
// de validación de datos bien formados pero con valores incorrectos (OWASP A01).
export class ValidationError extends AppError {
  constructor(message: string) { super(message, 422, 'VALIDATION_ERROR'); }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') { super(message, 401, 'UNAUTHORIZED'); }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') { super(message, 403, 'FORBIDDEN'); }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found') { super(message, 404, 'NOT_FOUND'); }
}

export class ConflictError extends AppError {
  constructor(message: string) { super(message, 409, 'CONFLICT'); }
}

// ¿Qué? 400 Bad Request para errores de lógica de negocio (token inválido, usado, expirado).
// ¿Para qué? Distinguir errores de dominio (400) de errores de validación de schema (422).
// ¿Impacto? El cliente sabe que el recurso fue encontrado pero su estado lo hace inutilizable.
export class BadRequestError extends AppError {
  constructor(message: string) { super(message, 400, 'BAD_REQUEST'); }
}

// ¿Qué? Middleware de Express para capturar todos los errores lanzados en la cadena.
// ¿Para qué? Retornar respuestas de error en formato JSON consistente.
// ¿Impacto? Debe registrarse DESPUÉS de todas las rutas en app.ts.
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    // ¿Qué? success:false mantiene el formato consistente con las respuestas exitosas.
    // ¿Para qué? El cliente siempre puede comprobar res.body.success para saber si
    //   la petición tuvo éxito sin necesidad de chequear el status code.
    res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
    return;
  }

  // Error no anticipado — loggear sin exponer detalles internos
  console.error('[ERROR]', err);
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
  });
}
