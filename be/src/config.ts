/**
 * Archivo: config.ts
 * Descripción: Configuración centralizada del backend con validación de variables de entorno.
 * ¿Para qué? Garantizar que la aplicación no arranque con configuración incompleta o inválida.
 * ¿Impacto? Si falta una variable crítica (ej: JWT_ACCESS_SECRET), la app falla al iniciar
 *   con un mensaje claro — mucho mejor que fallar silenciosamente en runtime.
 */

import { z } from 'zod';
import 'dotenv/config';

// ¿Qué? Schema zod que valida todas las variables de entorno requeridas.
// ¿Para qué? Fail-fast con mensajes claros si falta alguna variable.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  MAIL_HOST: z.string().default('localhost'),
  MAIL_PORT: z.coerce.number().default(1025),
  MAIL_FROM: z.string().email().default('noreply@nn-company.com'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = parsed.data;
export type Config = typeof config;
