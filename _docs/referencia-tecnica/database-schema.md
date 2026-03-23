# Esquema de Base de Datos — NN Auth System (Express Edition)

## Tecnologías

| Item | Detalle |
|---|---|
| Motor | PostgreSQL 17+ |
| ORM | Drizzle ORM |
| Migraciones | drizzle-kit |
| Driver | pg (node-postgres) |
| UUIDs | `gen_random_uuid()` (función nativa de PostgreSQL) |

---

## Diagrama Entidad-Relación

```
┌──────────────────────────────────────────────┐
│                   users                      │
├──────────────────────────────────────────────┤
│ PK  id            UUID        NOT NULL        │
│     email         VARCHAR(255) NOT NULL UNIQ  │
│     full_name     VARCHAR(255) NOT NULL        │
│     hashed_pass   VARCHAR(255) NOT NULL        │
│     is_active     BOOLEAN      DEFAULT TRUE    │
│     created_at    TIMESTAMP    DEFAULT NOW()   │
│     updated_at    TIMESTAMP    DEFAULT NOW()   │
└──────────────────────┬───────────────────────┘
                       │ 1
                       │
                       │ N  (un usuario puede tener
                       │     múltiples tokens de reset)
┌──────────────────────▼───────────────────────┐
│           password_reset_tokens               │
├──────────────────────────────────────────────┤
│ PK  id         UUID        NOT NULL           │
│ FK  user_id    UUID        NOT NULL → users.id│
│     token      VARCHAR(255) NOT NULL UNIQ     │
│     expires_at TIMESTAMP    NOT NULL          │
│     used       BOOLEAN      DEFAULT FALSE     │
│     created_at TIMESTAMP    DEFAULT NOW()     │
└──────────────────────────────────────────────┘
```

---

## Tabla `users`

Almacena los usuarios registrados en el sistema.

```sql
CREATE TABLE users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) NOT NULL UNIQUE,
  full_name     VARCHAR(255) NOT NULL,
  hashed_password VARCHAR(255) NOT NULL,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

### Columnas

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Identificador único del usuario |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE, INDEXED | Email de login — debe ser único en el sistema |
| `full_name` | VARCHAR(255) | NOT NULL | Nombre completo del usuario |
| `hashed_password` | VARCHAR(255) | NOT NULL | Hash bcrypt de la contraseña — NUNCA texto plano |
| `is_active` | BOOLEAN | DEFAULT TRUE | Permite desactivar cuentas sin eliminarlas |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Fecha de registro |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Fecha de última modificación |

### Notas de seguridad

- `hashed_password` almacena el hash bcrypt con factor de costo 12
- El campo `email` tiene índice para búsquedas rápidas durante el login
- `is_active = FALSE` permite banear usuarios sin perder datos históricos

---

## Tabla `password_reset_tokens`

Almacena los tokens temporales de recuperación de contraseña. Cada vez que el usuario solicita una recuperación, se genera un nuevo token.

```sql
CREATE TABLE password_reset_tokens (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP   NOT NULL,
  used       BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
```

### Columnas

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Identificador único del token |
| `user_id` | UUID | FK → users.id, ON DELETE CASCADE | Usuario propietario del token |
| `token` | VARCHAR(255) | NOT NULL, UNIQUE, INDEXED | Valor del token enviado por email (UUID v4) |
| `expires_at` | TIMESTAMP | NOT NULL | Momento de expiración (generalmente NOW() + 1 hora) |
| `used` | BOOLEAN | DEFAULT FALSE | TRUE cuando el token ya fue usado |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Fecha de creación del token |

### Ciclo de vida de un token

```
1. Usuario solicita forgot-password
   → Se crea registro: { token: uuid, expires_at: NOW()+1h, used: false }
   → Se envía email con el token

2. Usuario hace clic en enlace y envía nueva contraseña
   → Se busca token en BD
   → Se verifica: expires_at > NOW() AND used = false
   → Se actualiza contraseña del usuario
   → Se marca: used = true

3. Token expirado o ya usado
   → Se rechaza con 400
```

### Política de limpieza

Los tokens expirados pueden eliminarse periódicamente:

```sql
-- Borrar tokens expirados hace más de 7 días
DELETE FROM password_reset_tokens
WHERE expires_at < NOW() - INTERVAL '7 days';
```

---

## Definición Drizzle ORM (`src/db/schema.ts`)

```typescript
import { pgTable, uuid, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Tabla users
export const users = pgTable('users', {
  id:             uuid('id').primaryKey().defaultRandom(),
  email:          varchar('email', { length: 255 }).notNull().unique(),
  fullName:       varchar('full_name', { length: 255 }).notNull(),
  hashedPassword: varchar('hashed_password', { length: 255 }).notNull(),
  isActive:       boolean('is_active').notNull().default(true),
  createdAt:      timestamp('created_at').notNull().defaultNow(),
  updatedAt:      timestamp('updated_at').notNull().defaultNow(),
});

// Tabla password_reset_tokens
export const passwordResetTokens = pgTable('password_reset_tokens', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token:     varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  used:      boolean('used').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Relaciones
export const usersRelations = relations(users, ({ many }) => ({
  passwordResetTokens: many(passwordResetTokens),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

// Tipos inferidos
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;
```

---

## Migraciones con Drizzle Kit

### Configuración (`drizzle.config.ts`)

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Comandos

```bash
# Generar migración (compara schema.ts con el estado actual de la BD)
pnpm drizzle-kit generate

# Aplicar migraciones pendientes
pnpm drizzle-kit migrate

# Ver estado de migraciones
pnpm drizzle-kit status

# Abrir Drizzle Studio (interfaz visual de la BD)
pnpm drizzle-kit studio
```

### Regla fundamental

> **Nunca alterar la base de datos directamente.** Toda modificación al esquema debe hacerse en `schema.ts` y luego generar + aplicar la migración correspondiente con drizzle-kit.

---

## Configuración de Conexión (`src/db/index.ts`)

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { config } from '../config';

// Pool de conexiones PostgreSQL
const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: 10,              // máximo 10 conexiones simultáneas
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Instancia de Drizzle con el schema
export const db = drizzle(pool, { schema });
export type DB = typeof db;
```
