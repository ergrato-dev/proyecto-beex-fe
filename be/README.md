# 🟨 Backend — Express.js + TypeScript

<!--
  ¿Qué? Guía pedagógica completa del backend del sistema NN Auth.
  ¿Para qué? Que cualquier aprendiz entienda cada decisión técnica, cada archivo
    y cada patrón usado — sin necesidad de preguntar a otra persona.
  ¿Impacto? Sin documentación pedagógica, el código se convierte en una caja negra
    que se ejecuta pero no se comprende.
-->

> **Tecnologías:** Node.js 20 · Express.js 5 · TypeScript 5 · Drizzle ORM · PostgreSQL 17

---

## 📋 Tabla de Contenidos

1. [Prerrequisitos](#1-prerrequisitos)
2. [Estructura de carpetas](#2-estructura-de-carpetas)
3. [Instalación](#3-instalación)
4. [Variables de entorno](#4-variables-de-entorno)
5. [Configuración — `config.ts`](#5-configuración--configts)
6. [Base de datos — `db/index.ts`](#6-base-de-datos--dbindexts)
7. [Schema Drizzle — `db/schema.ts`](#7-schema-drizzle--dbschemats)
8. [Migraciones con Drizzle-Kit](#8-migraciones-con-drizzle-kit)
9. [Middleware de autenticación](#9-middleware-de-autenticación)
10. [Middleware de validación](#10-middleware-de-validación)
11. [Middleware de errores](#11-middleware-de-errores)
12. [Módulo Auth — router, controller, service, schema](#12-módulo-auth--router-controller-service-schema)
13. [Módulo Users — router, controller, service](#13-módulo-users--router-controller-service)
14. [Utilidades — `security.ts`](#14-utilidades--securityts)
15. [Utilidades — `email.ts`](#15-utilidades--emailts)
16. [Configuración Express — `app.ts`](#16-configuración-express--appts)
17. [Punto de entrada — `index.ts`](#17-punto-de-entrada--indexts)
18. [Tests — Vitest + Supertest](#18-tests--vitest--supertest)
19. [Comandos disponibles](#19-comandos-disponibles)
20. [Glosario](#20-glosario)

---

## 1. Prerrequisitos

| Herramienta | Versión | Verificar con      |
| ----------- | ------- | ------------------ |
| Node.js     | 20 LTS+ | `node --version`   |
| pnpm        | 9+      | `pnpm --version`   |
| PostgreSQL  | 17+     | Vía Docker Compose |

---

## 2. Estructura de carpetas

```
be/
├── drizzle.config.ts          # Configuración de Drizzle-Kit (migraciones)
├── package.json               # Dependencias y scripts (pnpm, versiones exactas)
├── tsconfig.json              # Configuración TypeScript
├── .env.example               # Plantilla de variables de entorno
├── .env                       # Variables reales (NO versionado en git)
└── src/
    ├── index.ts               # Punto de entrada — arranca el servidor HTTP
    ├── app.ts                 # Instancia Express + middlewares + rutas
    ├── config.ts              # Validación de .env con zod (fail-fast)
    ├── db/
    │   ├── index.ts           # Pool de conexiones pg + instancia Drizzle
    │   └── schema.ts          # Definición de tablas (fuente de verdad)
    ├── middlewares/
    │   ├── auth.middleware.ts    # Extrae y verifica JWT del header
    │   ├── validate.middleware.ts # Valida req.body con zod schemas
    │   └── error.middleware.ts   # Captura errores lanzados desde servicios
    ├── modules/
    │   ├── auth/
    │   │   ├── auth.router.ts     # Monta rutas en /api/v1/auth/
    │   │   ├── auth.controller.ts # Handlers HTTP (thin layer — solo req/res)
    │   │   ├── auth.service.ts    # Lógica de negocio — orquesta DB y utils
    │   │   └── auth.schema.ts     # Schemas zod para cada endpoint
    │   └── users/
    │       ├── users.router.ts    # Monta rutas en /api/v1/users/
    │       ├── users.controller.ts
    │       └── users.service.ts
    ├── utils/
    │   ├── security.ts        # hashPassword, verifyPassword, generateTokens
    │   └── email.ts           # sendPasswordResetEmail vía nodemailer
    └── tests/
        ├── setup.ts           # Setup global de Vitest (test DB, hooks)
        ├── helpers.ts         # Funciones reutilizables para tests
        └── auth.test.ts       # 20 tests de integración con supertest
```

---

## 3. Instalación

```bash
cd be

# Instalar todas las dependencias
pnpm install

# Verificar instalación
pnpm dev
# → ✅ Server running on http://localhost:3000
```

> ⚠️ **Siempre** usar `pnpm`. Nunca `npm install`.

---

## 4. Variables de entorno

El backend usa `dotenv` para cargar variables desde el archivo `.env`.
El archivo `.env` **nunca debe versionarse** en git (está en `.gitignore`).

Copiar la plantilla:

```bash
cp .env.example .env
```

Contenido de `.env.example`:

```bash
# Entorno de ejecución
NODE_ENV=development

# Puerto del servidor Express
PORT=3000

# Cadena de conexión a PostgreSQL
# Formato: postgresql://usuario:contraseña@host:puerto/nombre_bd
DATABASE_URL=postgresql://nn_user:nn_password@localhost:5432/nn_auth_db

# Secrets JWT — CAMBIAR EN PRODUCCIÓN (mínimo 32 caracteres, aleatorios)
JWT_ACCESS_SECRET=dev-access-secret-change-in-production-min-32-chars
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production-min-32-chars

# Duración de los tokens
JWT_ACCESS_EXPIRES_IN=15m    # Access token: 15 minutos (seguridad)
JWT_REFRESH_EXPIRES_IN=7d    # Refresh token: 7 días (comodidad)

# Configuración del servidor SMTP (Mailpit en desarrollo)
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_FROM=noreply@nn-company.com

# URL del frontend (para links en emails y CORS)
FRONTEND_URL=http://localhost:5173
```

> 🔑 **Por qué secrets de 32+ caracteres?**
> Los tokens JWT se firman con HMAC-SHA256. Un secret corto permite ataques de fuerza
> bruta. En producción, usar un generador criptográfico:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

---

## 5. Configuración — `config.ts`

**Archivo:** `src/config.ts`

Este archivo es el guardián de la configuración. Usa **zod** para validar todas las
variables de entorno al iniciar la aplicación. Si falta alguna o tiene un formato
incorrecto, el servidor **no arranca** y muestra un error claro.

```typescript
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  // ...más variables
});
```

**¿Por qué validar al inicio?**

El principio **Fail Fast** dice que es mejor fallar de inmediato con un mensaje claro
que fallar silenciosamente horas después cuando se intenta conectar a la BD. Si
`DATABASE_URL` falta, saberlo en el arranque (0 seg) es mejor que saberlo en el primer
request (tiempo indeterminado).

---

## 6. Base de datos — `db/index.ts`

**Archivo:** `src/db/index.ts`

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';
import { config } from '../config.js';

const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: 10,                    // máximo 10 conexiones simultáneas
  idleTimeoutMillis: 30_000,  // cerrar conexiones inactivas tras 30 seg
  connectionTimeoutMillis: 2_000, // error si no conecta en 2 seg
});

export const db = drizzle(pool, { schema });
```

**¿Qué es un Pool de conexiones?**

Abrir una conexión TCP a PostgreSQL cuesta entre 10-100ms. Si cada request abriera
y cerrara su propia conexión, la aplicación sería muy lenta. Un **pool** mantiene un
conjunto de conexiones abiertas y las reutiliza. Con `max: 10`, hasta 10 requests
pueden ejecutar queries simultáneamente; el resto espera en cola.

**¿Por qué exportar `db`?**

Toda la aplicación importa `db` desde este archivo para hacer queries. No hay conexiones
en otros archivos — un único punto de acceso a la BD.

---

## 7. Schema Drizzle — `db/schema.ts`

**Archivo:** `src/db/schema.ts`

Drizzle ORM tiene una filosofía diferente a ORMs tradicionales como Sequelize:
**el schema TypeScript ES la fuente de verdad**, no los modelos de una BD existente.

```typescript
export const users = pgTable('users', {
  id:             uuid('id').primaryKey().defaultRandom(),
  email:          varchar('email', { length: 255 }).notNull().unique(),
  fullName:       varchar('full_name', { length: 255 }).notNull(),
  hashedPassword: varchar('hashed_password', { length: 255 }).notNull(),
  isActive:       boolean('is_active').notNull().default(true),
  createdAt:      timestamp('created_at').notNull().defaultNow(),
  updatedAt:      timestamp('updated_at').notNull().defaultNow(),
});

export const passwordResetTokens = pgTable('password_reset_tokens', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token:     varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  used:      boolean('used').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

**Tipos inferidos automáticamente:**

```typescript
export type User = typeof users.$inferSelect;     // leer de BD
export type NewUser = typeof users.$inferInsert;  // insertar en BD
```

Con `$inferSelect`, Drizzle genera automáticamente el tipo TypeScript para las filas
devueltas por SELECT. Nunca hay que escribir `interface User { id: string; ... }`
manualmente — los tipos viven en el schema y están siempre sincronizados.

---

## 8. Migraciones con Drizzle-Kit

Las migraciones son archivos SQL que registran cómo evoluciona la BD.
**Nunca modificar la BD directamente** — siempre via migraciones.

```bash
# Generar archivos de migración desde el schema TypeScript
pnpm drizzle-kit generate
# → Crea archivos SQL en drizzle/ con los cambios detectados

# Aplicar las migraciones a la base de datos
pnpm drizzle-kit migrate
# → Ejecuta los SQL contra PostgreSQL

# Abrir Drizzle Studio (explorador visual de la BD)
pnpm db:studio
# → Abre en http://local.drizzle.studio
```

**Flujo de trabajo para cambiar el schema:**

1. Modificar `src/db/schema.ts`
2. `pnpm drizzle-kit generate` → Drizzle genera el SQL diff
3. Revisar el SQL generado en `drizzle/`
4. `pnpm drizzle-kit migrate` → Aplica el cambio

> 🧠 **Importante:** La carpeta `drizzle/` (con los archivos de migración generados)
> **sí debe versionarse** en git. Estos archivos son el historial de la BD.

---

## 9. Middleware de autenticación

**Archivo:** `src/middlewares/auth.middleware.ts`

```typescript
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Authorization header missing or invalid format');
  }
  const token = authHeader.slice(7);
  const payload = verifyAccessToken(token);
  req.user = { id: payload.sub, email: payload.email };
  next();
}
```

**¿Cómo funciona?**

Extrae el token del header `Authorization: Bearer <token>`, lo verifica con
`jsonwebtoken.verify()` y guarda los datos del usuario en `req.user` para que
los controllers puedan acceder a ellos sin volver a consultar la BD.

**¿Por qué `req.user`?**

Express permite extender la interfaz `Request` (en `@types/express`). Al almacenar
el usuario ahí, el middleware pasa la información verificada a todos los handlers
subsiguientes sin callbacks ni closures adicionales.

---

## 10. Middleware de validación

**Archivo:** `src/middlewares/validate.middleware.ts`

```typescript
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError(result.error.flatten().fieldErrors);
    }
    req.body = result.data; // reemplaza con datos validados y formateados
    next();
  };
}
```

**¿Por qué validar con zod?**

Los datos que vienen del cliente **nunca son confiables**. Si el frontend envía
`{ email: null }` o `{ password: "" }`, zod los rechaza antes de llegar al service.
Esto previene bugs difíciles de debuggear y es parte del principio OWASP A03 —
Injection.

**Uso en el router:**

```typescript
router.post('/register', validate(registerSchema), registerController);
//                       ↑ primero valida, luego ejecuta el controller
```

---

## 11. Middleware de errores

**Archivo:** `src/middlewares/error.middleware.ts`

```typescript
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    });
    return;
  }
  // Error desconocido — no exponer detalles internos
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
  });
}
```

**Jerarquía de errores tipados:**

```
AppError (base)
├── ValidationError   — 422 — datos del body inválidos
├── NotFoundError     — 404 — recurso no encontrado
├── UnauthorizedError — 401 — token inválido o ausente
├── ForbiddenError    — 403 — sin permisos suficientes
└── ConflictError     — 409 — conflicto (email ya registrado)
```

**¿Por qué una clase base `AppError`?**

El middleware global usa `instanceof AppError` para distinguir errores de la aplicación
(esperados, controlados) de errores de runtime (inesperados). Los errores controlados
tienen un `statusCode` y un `code` legibles. Los inesperados retornan 500 sin exponer
detalles internos (OWASP A05 — Security Misconfiguration).

---

## 12. Módulo Auth — router, controller, service, schema

El módulo de autenticación sigue el patrón **Router → Controller → Service → DB**.
Cada capa tiene una sola responsabilidad.

### Router (`auth.router.ts`)

```typescript
router.post('/register',         validate(registerSchema),       registerController);
router.post('/login',            validate(loginSchema),          loginController);
router.post('/refresh',          validate(refreshSchema),        refreshController);
router.post('/change-password',  authenticate, validate(changePasswordSchema), changePasswordController);
router.post('/forgot-password',  validate(forgotPasswordSchema), forgotPasswordController);
router.post('/reset-password',   validate(resetPasswordSchema),  resetPasswordController);
```

**¿Por qué separar Router del Controller?**

El router solo sabe **qué middleware aplicar antes de qué handler**.
El controller solo sabe **cómo extraer datos del request y formatear la respuesta**.
El service solo sabe **cómo ejecutar la lógica de negocio**.

Esta separación (Separation of Concerns) facilita los tests: el service se puede
testear de forma unitaria sin HTTP; el controller se puede testear sin preocuparse
por la lógica de negocio.

### Controller — ejemplo: login

```typescript
export async function loginController(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as LoginInput;
  const result = await loginUser(email, password);
  res.json(result);
}
```

El controller es delgado (**thin controller**): extrae datos del request y delega
al service. No contiene lógica de negocio.

### Service — ejemplo: login

```typescript
export async function loginUser(email: string, password: string): Promise<TokenResponse> {
  // 1. Buscar usuario
  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  
  // 2. Verificar contraseña (mensaje genérico — no revelar si el email existe)
  if (!user || !(await verifyPassword(password, user.hashedPassword))) {
    throw new UnauthorizedError('Invalid email or password');
  }
  
  // 3. Verificar que la cuenta está activa
  if (!user.isActive) {
    throw new ForbiddenError('Account is disabled');
  }

  // 4. Generar tokens
  const accessToken = generateAccessToken(user.id, user.email);
  const refreshToken = generateRefreshToken(user.id, user.email);
  
  return { access_token: accessToken, refresh_token: refreshToken, token_type: 'bearer' };
}
```

**OWASP A07 - Falla de Autenticación**: el mensaje _"Invalid email or password"_
es intencionalmente genérico. Si el error dijera _"Email not found"_ o
_"Wrong password"_, un atacante podría enumerar qué emails están registrados.

### Schema Zod (`auth.schema.ts`)

```typescript
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  fullName: z.string().min(2).max(255),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});
```

---

## 13. Módulo Users — router, controller, service

El módulo de usuarios provee el endpoint `GET /api/v1/users/me` para que el
cliente pueda obtener los datos del perfil del usuario autenticado.

```typescript
// users.router.ts
router.get('/me', authenticate, getMeController);

// users.controller.ts
export async function getMeController(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id; // disponible gracias al auth.middleware
  const user = await getUserById(userId);
  res.json(user);
}

// users.service.ts
export async function getUserById(userId: string): Promise<UserResponse> {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throw new NotFoundError('User not found');
  const { hashedPassword: _, ...rest } = user; // nunca exponer el hash
  return rest;
}
```

---

## 14. Utilidades — `security.ts`

**Archivo:** `src/utils/security.ts`

| Función                 | ¿Qué hace?                         | ¿Para qué?                              |
| ----------------------- | ---------------------------------- | --------------------------------------- |
| `hashPassword()`        | bcrypt.hash con salt rounds = 12   | Almacenar contraseñas de forma segura   |
| `verifyPassword()`      | bcrypt.compare                     | Validar credenciales en login           |
| `generateAccessToken()` | jwt.sign — expira en 15m           | Autenticar requests sin consultar BD    |
| `generateRefreshToken()` | jwt.sign — expira en 7d           | Renovar access tokens de forma segura   |
| `verifyRefreshToken()`  | jwt.verify + check type            | Validar refresh tokens en /auth/refresh |
| `verifyAccessToken()`   | jwt.verify + check type            | Validar access tokens en cada request   |

**¿Por qué 12 salt rounds en bcrypt?**

Cada round duplica el tiempo de cómputo. Con 12 rounds, hashear una contraseña
toma ~250ms en hardware moderno — imperceptible para un usuario real, pero
prohibitivo para un atacante que intenta millones de contraseñas. En 2024, 12
rounds es el mínimo recomendado.

---

## 15. Utilidades — `email.ts`

**Archivo:** `src/utils/email.ts`

```typescript
export async function sendPasswordResetEmail(
  to: string,
  resetToken: string,
): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: config.MAIL_HOST,
    port: config.MAIL_PORT,
    secure: false, // Mailpit no usa TLS
  });

  const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;

  await transporter.sendMail({
    from: config.MAIL_FROM,
    to,
    subject: 'Password Reset — NN Auth System',
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
           <p>This link expires in 1 hour.</p>`,
  });
}
```

**En desarrollo:** Mailpit captura todos los emails enviados y los muestra en su
web UI (`http://localhost:8025`). El email **nunca llega** a una bandeja de entrada
real — es solo para testing local.

**En producción:** cambiar `MAIL_HOST` y `MAIL_PORT` a un servicio SMTP real
(SendGrid, Mailgun, SES de AWS, o el servidor SMTP corporativo).

---

## 16. Configuración Express — `app.ts`

**Archivo:** `src/app.ts`

```typescript
const app: Application = express();

app.use(helmet());                     // Headers de seguridad
app.use(cors({ origin: config.FRONTEND_URL, credentials: true }));
app.use(express.json());               // Parsear body JSON

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,                   // 10 requests por IP
  standardHeaders: true,
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/v1/auth',  authRateLimit, authRouter);
app.use('/api/v1/users', usersRouter);
app.use(errorHandler); // ← AL FINAL, después de todas las rutas
```

**¿Por qué `app.ts` separado de `index.ts`?**

`app.ts` exporta la instancia de Express configurada. Esto permite importarla en
los tests de integración con `supertest(app)` **sin arrancar el servidor TCP**.
Si todo estuviera en `index.ts` con `app.listen()`, los tests iniciarían un servidor
real en cada test — más lento y con puertos en conflicto.

---

## 17. Punto de entrada — `index.ts`

**Archivo:** `src/index.ts`

```typescript
import app from './app.js';
import { config } from './config.js';

app.listen(config.PORT, () => {
  console.log(`✅ Server running on http://localhost:${config.PORT}`);
  console.log(`   Environment: ${config.NODE_ENV}`);
```

El único trabajo de `index.ts` es llamar `app.listen()`. Toda la configuración
de Express vive en `app.ts`. Esto sigue el principio de responsabilidad única (SRP).

---

## 18. Tests — Vitest + Supertest

**Archivos:** `src/tests/`

El backend tiene **20 tests de integración** que cubren todos los flujos de
autenticación. Se usan `vitest` como runner y `supertest` para hacer requests HTTP
reales contra la app de Express.

### Setup global (`setup.ts`)

```typescript
// Espera a que la BD esté disponible antes de correr los tests
beforeAll(async () => {
  const client = new Client({ connectionString: config.DATABASE_URL });
  await client.connect();
  await client.query('TRUNCATE TABLE users, password_reset_tokens CASCADE');
  await client.end();
});
```

### Ejemplo de test

```typescript
describe('POST /api/v1/auth/register', () => {
  it('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'Password1',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).not.toHaveProperty('hashedPassword');
  });

  it('should reject duplicate email with 409', async () => {
    await createTestUser(); // helper
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: TEST_EMAIL, fullName: 'Other', password: 'Password1' });

    expect(response.status).toBe(409);
  });
});
```

### Tests cubiertos

| Endpoint              | Tests                                                    |
| --------------------- | -------------------------------------------------------- |
| `POST /register`      | Registro exitoso, email duplicado, password débil        |
| `POST /login`         | Login correcto, credenciales inválidas, cuenta inactiva  |
| `POST /refresh`       | Refresh válido, token inválido                           |
| `POST /change-password` | Cambio exitoso, password actual incorrecta             |
| `POST /forgot-password` | Email existente, email no existente (respuesta genérica)|
| `POST /reset-password`  | Reset exitoso, token expirado, token ya usado          |
| `GET /users/me`       | Perfil autenticado, sin token, token inválido            |

---

## 19. Comandos disponibles

```bash
# Iniciar el servidor en modo desarrollo (tsx con hot-reload)
pnpm dev

# Compilar TypeScript a JavaScript
pnpm build

# Iniciar el servidor en modo producción (JavaScript compilado)
pnpm start

# Ejecutar todos los tests
pnpm test

# Ejecutar tests con cobertura
pnpm test:coverage

# Generar archivos de migración Drizzle (detecta cambios en schema.ts)
pnpm drizzle-kit generate

# Aplicar migraciones pendientes a la BD
pnpm drizzle-kit migrate

# Explorador visual de la BD en el navegador
pnpm db:studio

# Verificar errores de TypeScript sin compilar
pnpm typecheck

# Ejecutar ESLint
pnpm lint

# Ejecutar Prettier (formateo)
pnpm format
```

---

## 20. Glosario

| Término               | Definición                                                                              |
| --------------------- | --------------------------------------------------------------------------------------- |
| **ORM**               | _Object-Relational Mapping_ — mapea tablas SQL a objetos TypeScript                    |
| **Migración**         | Archivo SQL que describe cómo cambiar la estructura de la BD de una versión a otra      |
| **Drizzle-Kit**       | CLI de Drizzle para comparar el schema TypeScript con la BD y generar SQL de migración  |
| **JWT**               | _JSON Web Token_ — string firmado que contiene claims (userId, email, expiry)           |
| **Access Token**      | JWT de corta duración (15min) para autenticar requests protegidos                       |
| **Refresh Token**     | JWT de larga duración (7d) para obtener nuevos access tokens sin re-login               |
| **bcrypt**            | Algoritmo de hashing adaptativo para contraseñas — incluye salt y rounds configurables  |
| **Salt**              | Valor aleatorio añadido a la contraseña antes del hash — previene ataques de tabla arco iris |
| **Middleware**        | Función que se ejecuta entre recibir el request y enviar la respuesta                  |
| **Rate limiting**     | Limitar el número de requests por IP en un periodo — previene fuerza bruta              |
| **zod**               | Librería para definir schemas y validar datos en TypeScript con seguridad de tipos      |
| **Pool de conexiones**| Conjunto de conexiones TCP a BD reutilizables — evita abrir/cerrar una por request      |
| **OWASP**             | _Open Web Application Security Project_ — estándar de seguridad para web               |
| **Fail Fast**         | Principio de diseño: fallar de inmediato cuando se detecta un error — fácil de debuggear|
| **Thin Controller**   | Controller que solo maneja HTTP y delega toda la lógica al service                     |
| **supertest**         | Librería para hacer requests HTTP a una app Express en tests sin levantar un servidor   |
