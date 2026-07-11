/**
 * Archivo: app.ts
 * Descripción: Configuración de la aplicación Express con middlewares globales y rutas.
 * ¿Para qué? Centralizar toda la configuración de Express en un lugar, separado del
 *   punto de entrada (index.ts), facilitando los tests de integración.
 * ¿Impacto? Este archivo determina qué middlewares protegen la app y cómo se organizan
 *   las rutas. Un error aquí afecta a toda la aplicación.
 */

import express, { type Application, type Request, type Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { config } from './config.js';
import authRouter from './modules/auth/auth.router.js';
import usersRouter from './modules/users/users.router.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app: Application = express();

// ¿Qué? helmet configura automáticamente headers de seguridad HTTP.
// ¿Para qué? Proteger contra ataques comunes: clickjacking, MIME sniffing, XSS.
// ¿Impacto? Sin helmet, la app expone headers por defecto que revelan info del servidor.
app.use(helmet());

// ¿Qué? CORS — controla qué orígenes pueden hacer requests a esta API.
// ¿Para qué? Permitir que el frontend en localhost:5173 (o producción) acceda a la API.
// ¿Impacto? Sin CORS correcto, el browser bloquea todas las requests del frontend.
app.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true,
}));

// ¿Qué? Parsing de body JSON en todos los requests.
// ¿Para qué? Express necesita este middleware para leer req.body en POST/PUT.
app.use(express.json());

// ¿Qué? Rate limiting en endpoints de autenticación.
// ¿Para qué? Prevenir ataques de fuerza bruta en login, registro y recuperación.
// ¿Impacto? Sin rate limit, un atacante puede probar miles de contraseñas por segundo.
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  // ¿Qué? En entorno de tests se deshabilita el rate limit para evitar 429
  // por la ráfaga de peticiones que genera el suite de tests.
  // ¿Impacto? No afecta producción — NODE_ENV=test solo lo setea Vitest.
  skip: () => process.env.NODE_ENV === 'test',
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again in 15 minutes',
    },
  },
});

// ¿Qué? Health check — endpoint para verificar que el servidor está activo.
// ¿Para qué? Permitir que herramientas de monitoreo y Docker verifiquen la salud del servicio.
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ¿Qué? Registrar los routers bajo el prefijo /api/v1/.
// ¿Para qué? Versionar la API — permitir futuros cambios sin romper clientes v1.
// ¿Impacto? El rate limit solo aplica a auth para no penalizar otras rutas.
app.use('/api/v1/auth', authRateLimit, authRouter);
app.use('/api/v1/users', usersRouter);

// ¿Qué? Middleware global de errores — debe registrarse AL FINAL, después de las rutas.
// ¿Para qué? Capturar todos los errores lanzados en controllers y services.
// ¿Impacto? Sin este middleware, Express usa su handler por defecto que expone stack traces.
app.use(errorHandler);

export default app;
