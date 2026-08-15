// Archivo: prisma.config.ts
// Descripción: Configuración del Prisma CLI (generate/migrate/studio) para Prisma 7.
// ¿Para qué? Desde Prisma 7 la URL de conexión ya no vive en schema.prisma — el CLI la
//   lee de aquí.
// ¿Impacto? Sin este archivo, `prisma migrate`/`prisma generate` no saben a qué BD conectarse.

import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
