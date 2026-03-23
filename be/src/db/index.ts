/**
 * Archivo: db/index.ts
 * Descripción: Conexión a PostgreSQL con pool de conexiones y configuración de Drizzle ORM.
 * ¿Para qué? Proveer una instancia única de la BD reutilizable en todo el backend.
 * ¿Impacto? Sin conexión correcta, ninguna operación de datos funciona. El pool
 *   optimiza el rendimiento reutilizando conexiones existentes.
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';
import { config } from '../config.js';

// ¿Qué? Pool de conexiones PostgreSQL.
// ¿Para qué? Reutilizar conexiones en lugar de abrir/cerrar una por request.
// ¿Impacto? Sin pool, cada request abriría una conexión nueva — muy costoso a escala.
const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 2_000,
});

// ¿Qué? Instancia de Drizzle con el schema tipado.
// ¿Para qué? Tener acceso a consultas type-safe en todo el backend con solo importar `db`.
export const db = drizzle(pool, { schema });
export type DB = typeof db;
