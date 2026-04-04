/**
 * Archivo: types/express.d.ts
 * Descripción: Augmentación global del tipo Request de Express.
 * ¿Para qué? Agregar la propiedad `user` al objeto `req` de forma type-safe,
 *   para que los controllers protegidos puedan acceder a req.user sin casteos.
 * ¿Impacto? Sin esto, TypeScript no reconoce req.user en los handlers y exige
 *   casteos manuales o interfaces duplicadas (AuthRequest) que son incompatibles
 *   con el sistema de tipos de Express 5.
 */

// Augmentación del namespace Express para extender el Request estándar.
// ¿Qué? Declara que todo Request puede tener una propiedad `user`.
// ¿Para qué? Compartir el tipo de usuario autenticado entre middleware y controllers.
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export {};
