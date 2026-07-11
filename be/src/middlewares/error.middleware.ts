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

// ¿Qué? 401 Unauthorized — el cliente no está autenticado o su token es inválido.
// ¿Para qué? Diferenciar "no estás autenticado" (401) de "no tienes permiso" (403).
// ¿Impacto? El cliente debe redirigir al login cuando recibe este error.
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') { super(message, 401, 'UNAUTHORIZED'); }
}

// ¿Qué? 403 Forbidden — el cliente está autenticado pero no tiene permiso para esta acción.
// ¿Para qué? Usado cuando el usuario existe pero hay una condición que bloquea el acceso,
//   por ejemplo: email no verificado, cuenta desactivada.
// ¿Impacto? A diferencia del 401, el cliente sabe que está autenticado pero no autorizado.
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') { super(message, 403, 'FORBIDDEN'); }
}

// ¿Qué? 404 Not Found — el recurso solicitado no existe en la base de datos.
// ¿Para qué? Comunicar al cliente que la entidad buscada (usuario, token, etc.) no fue hallada.
// ¿Impacto? El cliente puede mostrar un mensaje apropiado sin confundirlo con un error del servidor.
export class NotFoundError extends AppError {
  constructor(message = 'Not found') { super(message, 404, 'NOT_FOUND'); }
}

// ¿Qué? 409 Conflict — el recurso ya existe y no se puede crear duplicado.
// ¿Para qué? Indicar al cliente que el dato que intenta registrar viola una restricción
//   de unicidad, como un email ya registrado.
// ¿Impacto? El cliente puede mostrar "este email ya está en uso" sin ambigüedad.
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
