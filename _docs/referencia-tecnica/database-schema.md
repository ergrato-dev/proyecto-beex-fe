# Esquema de Base de Datos — NN Auth System (Express Edition)

<!--
  ¿Qué? Documentación del esquema de base de datos: tablas, columnas, relaciones e índices.
  ¿Para qué? Servir como referencia para migraciones, revisiones de código y diseño del sistema.
  ¿Impacto? Cualquier cambio en el esquema debe reflejarse aquí antes de generar la migración con drizzle-kit.
-->

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
┌─────────────────────────────────────────────────────┐
│                       users                         │
├─────────────────────────────────────────────────────┤
│ PK  id                UUID         NOT NULL          │
│     email             VARCHAR(255) NOT NULL UNIQ     │
│     full_name         VARCHAR(255) NOT NULL          │
│     hashed_password   VARCHAR(255) NOT NULL          │
│     is_email_verified BOOLEAN      DEFAULT FALSE     │
│     locale            VARCHAR(10)  DEFAULT 'es'      │
│     is_active         BOOLEAN      DEFAULT TRUE      │
│     created_at        TIMESTAMP    DEFAULT NOW()     │
│     updated_at        TIMESTAMP    DEFAULT NOW()     │
└──────────┬─────────────────────────┬────────────────┘
           │ 1                       │ 1
           │                         │
           │ N                       │ N
┌──────────▼────────────┐  ┌────────▼──────────────────┐
│  password_reset_tokens│  │  email_verification_tokens │
├───────────────────────┤  ├────────────────────────────┤
│ PK id        UUID     │  │ PK id        UUID           │
│ FK user_id   UUID     │  │ FK user_id   UUID           │
│    token     VARCHAR  │  │    token     VARCHAR        │
│    expires_at TIMESTAMP│ │    expires_at TIMESTAMP     │
│    used      BOOLEAN  │  │    used      BOOLEAN        │
│    created_at TIMESTAMP│ │    created_at TIMESTAMP     │
└───────────────────────┘  └────────────────────────────┘
```

---

## Tabla `users`

Almacena los usuarios registrados en el sistema.

```sql
CREATE TABLE users (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email               VARCHAR(255) NOT NULL UNIQUE,
  full_name           VARCHAR(255) NOT NULL,
  hashed_password     VARCHAR(255) NOT NULL,
  is_email_verified   BOOLEAN     NOT NULL DEFAULT FALSE,
  locale              VARCHAR(10)  NOT NULL DEFAULT 'es',
  is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMP   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP   NOT NULL DEFAULT NOW()
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
| `is_email_verified` | BOOLEAN | DEFAULT FALSE | Indica si el email fue verificado. El login requiere `true` |
| `locale` | VARCHAR(10) | DEFAULT 'es' | Idioma preferido: `"es"` o `"en"` |
| `is_active` | BOOLEAN | DEFAULT TRUE | Permite desactivar cuentas sin eliminarlas |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Fecha de registro |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Fecha de última modificación |

### Notas de seguridad

- `hashed_password` almacena el hash bcrypt con factor de costo 12
- El campo `email` tiene índice para búsquedas rápidas durante el login
- `is_active = FALSE` permite banear usuarios sin perder datos históricos
- `is_email_verified` actúa como gate del login — `false` retorna HTTP 403

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
| `token` | VARCHAR(255) | NOT NULL, UNIQUE, INDEXED | Valor del token enviado por email |
| `expires_at` | TIMESTAMP | NOT NULL | Momento de expiración (NOW() + 1 hora) |
| `used` | BOOLEAN | DEFAULT FALSE | `true` cuando el token ya fue usado |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Fecha de creación del token |

### Ciclo de vida de un token

```
1. Usuario solicita forgot-password
   → Se crea registro: { token: hex64chars, expires_at: NOW()+1h, used: false }
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

## Tabla `email_verification_tokens`

Almacena los tokens temporales para la verificación de email tras el registro.
El usuario no puede hacer login hasta que el token sea usado y `users.is_email_verified = true`.

```sql
CREATE TABLE email_verification_tokens (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP   NOT NULL,
  used       BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_email_verification_tokens_token ON email_verification_tokens(token);
```

### Columnas

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Identificador único del token |
| `user_id` | UUID | FK → users.id, ON DELETE CASCADE | Usuario a quien pertenece el token |
| `token` | VARCHAR(255) | NOT NULL, UNIQUE, INDEXED | Valor del token enviado por email |
| `expires_at` | TIMESTAMP | NOT NULL | Momento de expiración (NOW() + 24 horas) |
| `used` | BOOLEAN | DEFAULT FALSE | `true` cuando el token fue usado para activar la cuenta |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Fecha de creación del token |

### Ciclo de vida

```
1. Usuario se registra
   → Se crea usuario con is_email_verified = false
   → Se crea token: { token: hex64chars, expires_at: NOW()+24h, used: false }
   → Se envía email con enlace: {FRONTEND_URL}/verify-email?token={token}

2. Usuario hace clic en el enlace
   → Se busca token en BD
   → Se verifica: expires_at > NOW() AND used = false
   → Se actualiza: users.is_email_verified = true
   → Se marca: used = true
   → El usuario puede hacer login

3. Token expirado o ya usado
   → Se rechaza con 400
```

---

## Definición Drizzle ORM (`src/db/schema.ts`)

```typescript
import { pgTable, uuid, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Tabla users
export const users = pgTable('users', {
  id:                uuid('id').primaryKey().defaultRandom(),
  email:             varchar('email', { length: 255 }).notNull().unique(),
  fullName:          varchar('full_name', { length: 255 }).notNull(),
  hashedPassword:    varchar('hashed_password', { length: 255 }).notNull(),
  isEmailVerified:   boolean('is_email_verified').notNull().default(false),
  locale:            varchar('locale', { length: 10 }).notNull().default('es'),
  isActive:          boolean('is_active').notNull().default(true),
  createdAt:         timestamp('created_at').notNull().defaultNow(),
  updatedAt:         timestamp('updated_at').notNull().defaultNow(),
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

// Tabla email_verification_tokens
export const emailVerificationTokens = pgTable('email_verification_tokens', {
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
  emailVerificationTokens: many(emailVerificationTokens),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

export const emailVerificationTokensRelations = relations(emailVerificationTokens, ({ one }) => ({
  user: one(users, {
    fields: [emailVerificationTokens.userId],
    references: [users.id],
  }),
}));

// Tipos inferidos
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;
export type EmailVerificationToken = typeof emailVerificationTokens.$inferSelect;
export type NewEmailVerificationToken = typeof emailVerificationTokens.$inferInsert;
```

---

## Migraciones con Drizzle Kit

### Configuración (`drizzle.config.ts`)

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',

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
