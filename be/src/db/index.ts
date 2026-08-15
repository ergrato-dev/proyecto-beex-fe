/**
 * Archivo: db/index.ts
 * Descripción: Instancia única de Prisma Client para todo el backend.
 * ¿Para qué? Proveer una instancia única de la BD reutilizable en todo el backend.
 * ¿Impacto? Sin conexión correcta, ninguna operación de datos funciona. Prisma 7 requiere
 *   un driver adapter explícito (ya no lee la URL desde schema.prisma en runtime) — usamos
 *   `@prisma/adapter-pg`, que gestiona internamente su propio pool sobre `pg`.
 */

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { config } from '../config.js';

const adapter = new PrismaPg({ connectionString: config.DATABASE_URL });

// ¿Qué? Instancia de Prisma Client con los tipos generados desde prisma/schema.prisma.
// ¿Para qué? Tener acceso a consultas type-safe en todo el backend con solo importar `db`.
export const db = new PrismaClient({ adapter });
export type DB = typeof db;
