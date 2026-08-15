# Esquema de Base de Datos — NN Auth System (Express Edition)

<!--
  ¿Qué? Documentación del esquema de base de datos: tablas, columnas, relaciones e índices.
  ¿Para qué? Servir como referencia para migraciones, revisiones de código y diseño del sistema.
  ¿Impacto? Cualquier cambio en el esquema debe reflejarse aquí antes de generar la migración con Prisma.
-->

## Tecnologías

| Item | Detalle |
|---|---|
| Motor | PostgreSQL 17+ |
| ORM | Prisma ORM |
| Migraciones | Prisma Migrate |
| Driver | `@prisma/adapter-pg` sobre `pg` (node-postgres) |
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

## Definición Prisma (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

model User {
  id             String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email          String   @unique @db.VarChar(255)
  fullName       String   @map("full_name") @db.VarChar(255)
  hashedPassword String   @map("hashed_password") @db.VarChar(255)
  isActive       Boolean  @default(true) @map("is_active")
  isEmailVerified Boolean @default(false) @map("is_email_verified")
  locale         String   @default("es") @db.VarChar(10)
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @default(now()) @map("updated_at")

  passwordResetTokens     PasswordResetToken[]
  emailVerificationTokens EmailVerificationToken[]

  @@map("users")
}

model PasswordResetToken {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  token     String   @unique @db.VarChar(255)
  expiresAt DateTime @map("expires_at")
  used      Boolean  @default(false)
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("password_reset_tokens")
}

model EmailVerificationToken {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  token     String   @unique @db.VarChar(255)
  expiresAt DateTime @map("expires_at")
  used      Boolean  @default(false)
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("email_verification_tokens")
}
```

Los nombres de campo van en camelCase (convención TypeScript) y se mapean a las columnas
snake_case reales vía `@map`/`@@map` — la BD no cambia, solo cambia el ORM que la consulta.

---

## Migraciones con Prisma

### Configuración del CLI (`prisma.config.ts`)

Desde Prisma 7, la URL de conexión ya no vive en `schema.prisma` — el CLI la lee de
`prisma.config.ts`, en la raíz de `be/`:

```typescript
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
```

### Comandos

```bash
# Regenerar el cliente de Prisma (tipos TypeScript) desde el schema
pnpm db:generate

# Crear + aplicar una migración nueva a partir de un cambio en schema.prisma (desarrollo)
pnpm db:migrate:dev

# Aplicar migraciones ya existentes sin crear una nueva (CI / producción)
pnpm db:migrate

# Ver estado de las migraciones
pnpm db:status

# Abrir Prisma Studio (interfaz visual de la BD)
pnpm db:studio
```

### Regla fundamental

> **Nunca alterar la base de datos directamente.** Toda modificación al esquema debe hacerse
> en `prisma/schema.prisma` y luego generar + aplicar la migración correspondiente con
> `pnpm db:migrate:dev`.

---

## Configuración de Conexión (`src/db/index.ts`)

Prisma 7 requiere un driver adapter explícito — ya no instancia su motor de conexión
automáticamente a partir de la URL del schema:

```typescript
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { config } from '../config.js';

const adapter = new PrismaPg({ connectionString: config.DATABASE_URL });

export const db = new PrismaClient({ adapter });
export type DB = typeof db;
```
