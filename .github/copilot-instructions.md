# 🎓 Instrucciones del Proyecto — NN Auth System (Express Edition)

## 1. Identidad del Proyecto

| Campo           | Valor                                                                                                                                                                                                                      |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nombre          | NN Auth System — Express Edition                                                                                                                                                                                           |
| Tipo            | Proyecto educativo — SENA                                                                                                                                                                                                  |
| Propósito       | Sistema de autenticación completo (registro, login, cambio y recuperación de contraseña) para una empresa genérica "NN". Mismo dominio funcional que el proyecto original (FastAPI + Python), diferente stack tecnológico. |
| Stack           | React + Express.js + PostgreSQL                                                                                                                                                                                            |
| Enfoque         | Aprendizaje guiado: cada línea de código y documentación debe enseñar                                                                                                                                                      |
| Fecha de inicio | Marzo 2026                                                                                                                                                                                                                 |

---

## 2. Stack Tecnológico

### 2.1 Backend (`be/`)

| Tecnología         | Versión | Rol                                              |
| ------------------ | ------- | ------------------------------------------------ |
| Node.js            | 20 LTS+ | Runtime principal del backend                    |
| Express.js         | 5+      | Framework web HTTP                               |
| TypeScript         | 5.0+    | Tipado estático — obligatorio                    |
| PostgreSQL         | 17+     | Base de datos relacional                         |
| pg (node-postgres) | latest  | Driver PostgreSQL nativo — usado por Prisma via `@prisma/adapter-pg` |
| Prisma ORM         | latest  | ORM type-safe con migraciones declarativas       |
| prisma             | latest  | CLI para generate/migrate de Prisma              |
| jsonwebtoken       | latest  | Creación y verificación de tokens JWT            |
| bcryptjs           | latest  | Hashing seguro de contraseñas                    |
| zod                | latest  | Validación de datos y schemas (request/response) |
| nodemailer         | latest  | Envío de emails (recuperación de contraseña)     |
| dotenv             | latest  | Carga de variables de entorno desde `.env`       |
| cors               | latest  | Middleware CORS para Express                     |
| helmet             | latest  | Headers de seguridad HTTP                        |
| express-rate-limit | latest  | Rate limiting para endpoints de auth             |
| vitest             | latest  | Framework de testing                             |
| supertest          | latest  | Tests HTTP de integración para Express           |
| ESLint             | latest  | Linter TypeScript                                |
| Prettier           | latest  | Formateador de código                            |
| tsx                | latest  | Ejecutar TypeScript directamente (dev)           |

### 2.2 Frontend (`fe/`)

| Tecnología      | Versión | Rol                                          |
| --------------- | ------- | -------------------------------------------- |
| Node.js         | 20 LTS+ | Runtime de JavaScript                        |
| React           | 18+     | Biblioteca para interfaces de usuario        |
| Vite            | 6+      | Bundler y dev server ultrarrápido            |
| TypeScript      | 5.0+    | Superset tipado de JavaScript — obligatorio  |
| TailwindCSS     | 4+      | Framework CSS utility-first                  |
| React Router    | 7+      | Enrutamiento del lado del cliente            |
| Axios           | latest  | Cliente HTTP para comunicación con la API    |
| Vitest          | latest  | Framework de testing compatible con Vite     |
| Testing Library | latest  | Utilidades de testing para componentes React |
| ESLint          | latest  | Linter para TypeScript/React                 |
| Prettier        | latest  | Formateador de código                        |

### 2.3 Base de Datos

| Tecnología     | Versión | Rol                                                     |
| -------------- | ------- | ------------------------------------------------------- |
| PostgreSQL     | 17+     | Base de datos relacional principal                      |
| Docker Compose | latest  | Orquestación de contenedores (BD + email en desarrollo) |
| Mailpit        | latest  | Captura SMTP local para desarrollo (UI en :8025)        |

### 2.4 Autenticación

| Item          | Detalle                                                       |
| ------------- | ------------------------------------------------------------- |
| Método        | JWT (JSON Web Tokens) — stateless                             |
| Access Token  | Duración: 15 minutos                                          |
| Refresh Token | Duración: 7 días                                              |
| Hashing       | bcrypt vía bcryptjs                                           |
| Flujos        | Registro, Login, Cambio de contraseña, Recuperación por email |

---

## 3. Reglas de Lenguaje — OBLIGATORIAS

### 3.1 Nomenclatura técnica → INGLÉS

Todo lo que sea código debe estar en inglés:

- Variables, funciones, clases, métodos
- Nombres de archivos y carpetas de código
- Endpoints y rutas de la API
- Nombres de tablas y columnas en la base de datos
- Nombres de componentes React
- Mensajes de commits
- Ramas de git

```typescript
// ✅ CORRECTO
function getUserByEmail(email: string): Promise<User> { ... }

// ❌ INCORRECTO
function obtenerUsuarioPorEmail(correo: string): Promise<Usuario> { ... }
```

### 3.2 Comentarios y documentación → ESPAÑOL

Todo lo que sea documentación o comentarios debe estar en español:

- Comentarios en el código (`//`, `/* */`)
- JSDoc de funciones y clases
- Archivos de documentación (`.md`)
- README.md
- Descripciones en archivos de configuración

### 3.3 Regla del comentario pedagógico — ¿QUÉ? ¿PARA QUÉ? ¿IMPACTO?

Cada comentario significativo debe responder tres preguntas:

```typescript
/**
 * ¿Qué? Función que hashea la contraseña del usuario usando bcrypt.
 * ¿Para qué? Almacenar contraseñas de forma segura, nunca en texto plano.
 * ¿Impacto? Si se omite el hashing, las contraseñas quedan expuestas ante
 *   una filtración de la base de datos.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
```

### 3.4 Cabecera de archivo obligatoria

Cada archivo nuevo debe incluir un comentario de cabecera al inicio:

```typescript
/**
 * Archivo: security.ts
 * Descripción: Utilidades de seguridad — hashing de contraseñas y manejo de tokens JWT.
 * ¿Para qué? Proveer funciones reutilizables de seguridad que se usan en todo el sistema de auth.
 * ¿Impacto? Es la base de la seguridad del sistema. Un error aquí compromete toda la autenticación.
 */
```

---

## 4. Reglas de Entorno y Herramientas — OBLIGATORIAS

### 4.0 REGLA CERO — Auditoría de seguridad antes de instalar cualquier paquete

> ⚠️ **OBLIGATORIO sin excepción.** Antes de ejecutar `pnpm add <paquete>`, verificar que la versión a instalar no tenga CVEs conocidos.

El ecosistema npm ha sido vector de ataques de supply chain de alto impacto (event-stream 2018, ua-parser-js 2021, node-ipc 2022, polyfill.io 2024, axios 1.13.x 2026). Paquetes de uso masivo son objetivos prioritarios porque un solo compromiso afecta millones de proyectos.

#### Protocolo de instalación de paquetes

```bash
# PASO 1 — Consultar el registro de vulnerabilidades ANTES de instalar
# Fuentes de consulta obligatorias (usar al menos una):
#   https://security.snyk.io/package/npm/<nombre-paquete>
#   https://www.npmjs.com/advisories
#   https://osv.dev/?ecosystem=npm

# PASO 2 — Verificar versiones afectadas vs versión a instalar
# Buscar la columna de vulnerabilidades por versión en Snyk

# PASO 3 — Instalar SOLO si la versión no tiene CVEs
# Siempre usar versión exacta, nunca rangos ^ ni ~
pnpm add paquete@X.Y.Z      # ✅ versión exacta verificada

# PASO 4 — Documentar en el commit qué se verificó
# chore(deps): add axios 1.14.0
# For: http client for API communication
# Impact: verified CVE-free on security.snyk.io (1.13.x had 1 High CVE)
```

#### Versiones con CVE conocidos en este proyecto — historial

| Paquete      | Versiones afectadas | Severidad             | CVE / Referencia                                                          | Versión / Fix aplicado                                                       |
| ------------ | ------------------- | --------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `axios`      | `1.13.0 – 1.13.4`   | High                  | CSRF/SSRF — supply chain incident                                         | `1.14.0` ✅                                                                  |
| `jspdf`      | `< 4.2.1`           | Medium                | 2 vulns en `4.2.0`, Critical en `< 4.0.0`                                 | `4.2.1` ✅                                                                   |
| `nodemailer` | `6.x – ≤7.0.10`     | High + Moderate + Low | DoS (addressparser), email domain spoofing, SMTP injection                | `8.0.4` ✅                                                                   |
| `esbuild`    | `≤ 0.24.2`          | Moderate              | GHSA-67mh-4wv8-2f99 — dev server CORS bypass (acepta peticiones externas) | `pnpm.overrides "esbuild": "0.27.7"` + `vitest@4.1.2` + `vite@8.0.3` (BE) ✅ |

> Actualizar esta tabla cada vez que se detecte o resuelva una vulnerabilidad en una dependencia del proyecto.

#### Señales de alerta — auditar inmediatamente si

- El paquete tiene actividad inusual reciente en releases (versión publicada y retirada rápidamente)
- El mantenedor cambió recientemente
- `pnpm audit` reporta advertencias tras una actualización
- GitHub/npm muestra un advisory de seguridad

```bash
# Auditar dependencias actuales en cualquier momento
cd be && pnpm audit
cd fe && pnpm audit
```

---

### 4.1 Node.js — SIEMPRE usar `pnpm`

```bash
# ✅ CORRECTO
pnpm install
pnpm add axios
pnpm add -D vitest
pnpm dev
pnpm test
pnpm build

# ❌ INCORRECTO — NUNCA usar npm
npm install        # ← PROHIBIDO
npm run dev        # ← PROHIBIDO
npx some-tool      # ← Usar pnpm dlx en su lugar

# ❌ INCORRECTO — NUNCA usar yarn
yarn install       # ← PROHIBIDO
```

Si algún tutorial o documentación sugiere `npm`, reemplazar por el equivalente `pnpm`.

### 4.2 ⛔ Regla de Oro — Pinning de dependencias (OBLIGATORIO)

> **Versiones flotantes = builds no reproducibles = riesgo de CVE silencioso.**

#### Prohibido en `package.json`

```json
// ❌ NUNCA — rangos de versión flotantes
"tailwindcss": "^4.1.0",
"vite": "~6.2.0",
"react": ">=19.0.0",
"esbuild": "*",
"axios": "latest"
```

#### Obligatorio — versiones exactas siempre

```json
// ✅ SIEMPRE — versión exacta, sin prefijos
"tailwindcss": "4.1.0",
"vite": "8.0.3",
"react": "19.1.0",
"esbuild": "0.27.7"
```

#### Para dependencias transitivas vulnerables → `pnpm.overrides`

Cuando una dependencia de tercer nivel (transitiva) tiene un CVE y no se puede actualizar el padre:

```json
// ✅ Correcto — forzar versión segura de transitive dep
"pnpm": {
  "overrides": {
    "esbuild": "0.27.7"
  }
}
```

Caso real de este proyecto: `drizzle-kit` traía `esbuild@0.18.20` y `0.19.12` (CVE GHSA-67mh-4wv8-2f99). Se resolvió con `pnpm.overrides` + upgrade de `vitest` + `vite` a versiones que usan `esbuild ≥ 0.25.0`. `drizzle-kit` ya no está en el proyecto (migración a Prisma, ver `AUDITORIA.md`), pero el patrón de `esbuild` anclado por el toolchain de Vite se repitió — el override vive ahora en `be/pnpm-workspace.yaml`.

#### Cómo pnpm enforce versiones exactas automáticamente

```bash
# Global (ya configurado en ~/.config/pnpm/rc)
save-exact=true

# También en cada workspace del repo (.npmrc)
save-exact=true
```

Con `save-exact=true`, cualquier `pnpm add` guarda la versión instalada exacta, nunca con `^` ni `~`.

#### Motivación

| Riesgo                  | Detalle                                                                      |
| ----------------------- | ---------------------------------------------------------------------------- |
| CVEs silenciosos        | Un rango como `^4.0.0` puede instalar `4.9.9` con vulnerabilidades sin aviso |
| Builds no reproducibles | Dos `pnpm install` en fechas distintas → resultados distintos                |
| Supply-chain attacks    | Una actualización automática puede inyectar código malicioso                 |
| Auditorías inútiles     | No se puede fijar qué versión se ejecuta en producción                       |

---

### 4.3 Variables de entorno

- NUNCA hardcodear credenciales, URLs de base de datos, secrets, o configuración sensible
- Usar archivos `.env` (no versionados en git)
- Proveer siempre un `.env.example` con las variables necesarias y valores de ejemplo
- Validar las variables de entorno al iniciar la aplicación (con zod en BE)

```bash
# be/.env.example
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://nn_user:nn_password@localhost:5432/nn_auth_db
JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_FROM=noreply@nn-company.com
FRONTEND_URL=http://localhost:5173
```

---

## 5. Estructura del Proyecto

```
proyecto/                          # Raíz del monorepo
├── .github/
│   └── copilot-instructions.md    # ← ESTE ARCHIVO — reglas del proyecto
├── .gitignore                     # Archivos ignorados por git
├── docker-compose.yml             # Servicios: PostgreSQL 17 + Mailpit
├── README.md                      # Documentación principal del proyecto
│
├── docs/                         # 📚 Documentación del proyecto
│   ├── referencia-tecnica/
│   │   ├── architecture.md        # Arquitectura general y diagramas
│   │   ├── api-endpoints.md       # Documentación de todos los endpoints
│   │   └── database-schema.md     # Esquema de base de datos y ER diagram
│   ├── conceptos/
│   │   ├── owasp-top-10.md        # Implementación del OWASP Top 10 2021
│   │   ├── accesibilidad-aria-wcag.md
│   │   └── patrones-arquitectonicos.md
│   └── requisitos/
│       ├── HUs/                   # Historias de Usuario
│       ├── RFs/                   # Requisitos Funcionales
│       ├── RNFs/                  # Requisitos No Funcionales
│       └── restricciones.md
│
├── be/                            # 🟨 Backend — Express.js + TypeScript
│   ├── .env                       # Variables de entorno (NO versionado)
│   ├── .env.example               # Plantilla de variables de entorno
│   ├── package.json               # Dependencias y scripts
│   ├── pnpm-lock.yaml             # Lockfile de pnpm
│   ├── tsconfig.json              # Configuración de TypeScript
│   ├── eslint.config.js           # Configuración de ESLint
│   ├── prisma.config.ts           # Configuración del Prisma CLI (generate/migrate)
│   ├── prisma/
│   │   ├── schema.prisma          # Definición de tablas (Prisma)
│   │   └── migrations/            # Historial de migraciones SQL
│   └── src/
│       ├── index.ts               # Punto de entrada — arranca el servidor
│       ├── app.ts                 # Configura Express, middlewares y rutas
│       ├── config.ts              # Configuración centralizada (validación con zod)
│       ├── db/
│       │   └── index.ts           # Instancia de Prisma Client (driver adapter sobre pg)
│       ├── middlewares/
│       │   ├── auth.middleware.ts  # Verifica JWT en requests protegidos
│       │   ├── validate.middleware.ts # Valida body/params con zod schemas
│       │   └── error.middleware.ts    # Manejador global de errores
│       ├── modules/
│       │   ├── auth/
│       │   │   ├── auth.router.ts   # Rutas de autenticación
│       │   │   ├── auth.controller.ts # Handlers HTTP (thin layer)
│       │   │   ├── auth.service.ts    # Lógica de negocio
│       │   │   └── auth.schema.ts     # Schemas zod (validación)
│       │   └── users/
│       │       ├── users.router.ts
│       │       ├── users.controller.ts
│       │       ├── users.service.ts
│       │       └── users.schema.ts
│       ├── utils/
│       │   ├── security.ts        # Hashing bcrypt + JWT
│       │   └── email.ts           # Envío de emails (nodemailer)
│       └── tests/
│           ├── setup.ts           # Setup global de tests
│           ├── helpers.ts         # Helpers compartidos para tests
│           └── auth.test.ts       # Tests de autenticación
│
└── fe/                            # ⚛️ Frontend — React + Vite + TypeScript
    ├── .env                       # Variables de entorno (NO versionado)
    ├── .env.example               # Plantilla de variables de entorno
    ├── index.html                 # HTML base de Vite
    ├── package.json               # Dependencias y scripts
    ├── pnpm-lock.yaml             # Lockfile de pnpm
    ├── vite.config.ts             # Configuración de Vite
    ├── tsconfig.json              # Configuración de TypeScript
    ├── eslint.config.js           # Configuración de ESLint
    └── src/
        ├── main.tsx               # Punto de entrada — renderiza App en el DOM
        ├── App.tsx                # Componente raíz — define rutas
        ├── index.css              # Estilos globales + imports de Tailwind
        ├── api/
        │   └── auth.ts            # Funciones para cada endpoint de auth
        ├── components/
        │   ├── ui/                # Componentes UI genéricos (Button, Input, Alert)
        │   └── layout/            # Layout, Navbar, Footer
        ├── pages/
        │   ├── LandingPage.tsx
        │   ├── LoginPage.tsx
        │   ├── RegisterPage.tsx
        │   ├── DashboardPage.tsx
        │   ├── ChangePasswordPage.tsx
        │   ├── ForgotPasswordPage.tsx
        │   ├── ResetPasswordPage.tsx
        │   ├── ContactPage.tsx
        │   ├── TerminosDeUsoPage.tsx
        │   ├── PoliticaPrivacidadPage.tsx
        │   └── PoliticaCookiesPage.tsx
        ├── hooks/
        │   └── useAuth.ts
        ├── context/
        │   └── AuthContext.tsx
        ├── types/
        │   └── auth.ts
        ├── utils/
        └── __tests__/
            └── auth.test.tsx
```

---

## 6. Convenciones de Código

### 6.1 TypeScript — Backend (Express)

| Aspecto                    | Regla                                                             |
| -------------------------- | ----------------------------------------------------------------- |
| Estilo                     | ESLint + Prettier                                                 |
| Naming variables/funciones | camelCase                                                         |
| Naming clases              | PascalCase                                                        |
| Naming constantes          | UPPER_SNAKE_CASE                                                  |
| Naming archivos de módulo  | kebab-case (auth.service.ts)                                      |
| Type hints                 | Obligatorios en parámetros y retornos                             |
| Patrón                     | Router → Controller → Service → DB                                |
| Errores                    | Lanzar con clases de error tipadas, capturar en middleware global |
| Imports                    | Ordenados: built-ins → third-party → internos                     |
| Línea máxima               | 100 caracteres                                                    |

```typescript
// ✅ Ejemplo de service bien documentado y tipado
/**
 * ¿Qué? Registra un nuevo usuario en el sistema.
 * ¿Para qué? Crear la cuenta con contraseña hasheada y datos validados.
 * ¿Impacto? Sin esta función no hay forma de incorporar usuarios al sistema.
 */
export async function registerUser(data: RegisterInput): Promise<UserResponse> {
  const existing = await db.query.users.findFirst({
    where: eq(users.email, data.email),
  });
  if (existing) {
    throw new ConflictError("Email already registered");
  }
  const hashedPassword = await hashPassword(data.password);
  const [user] = await db
    .insert(users)
    .values({
      email: data.email,
      fullName: data.fullName,
      hashedPassword,
    })
    .returning();
  return toUserResponse(user);
}
```

### 6.2 TypeScript/React (Frontend)

| Aspecto             | Regla                                                                 |
| ------------------- | --------------------------------------------------------------------- |
| Estilo              | ESLint + Prettier                                                     |
| Naming variables    | camelCase                                                             |
| Naming componentes  | PascalCase                                                            |
| Naming archivos     | PascalCase para componentes, camelCase para utilidades                |
| Naming tipos        | PascalCase con sufijo descriptivo (UserResponse, LoginRequest)        |
| Componentes         | Funcionales con hooks — nunca clases                                  |
| Interfaces vs Types | Preferir `interface` para objetos, `type` para uniones/intersecciones |
| CSS                 | TailwindCSS utility classes — evitar CSS custom                       |
| Strict mode         | `"strict": true` en tsconfig.json                                     |

### 6.3 SQL / Base de Datos

| Aspecto             | Regla                                                 |
| ------------------- | ----------------------------------------------------- |
| Nombres de tablas   | snake_case, plural (users, password_reset_tokens)     |
| Nombres de columnas | snake_case (created_at, hashed_password)              |
| Primary Keys        | id (UUID, default gen_random_uuid())                  |
| Foreign Keys        | `<tabla_singular>_id` (ej: user_id)                   |
| Timestamps          | created_at, updated_at en toda tabla                  |
| Migraciones         | Siempre vía Prisma (`pnpm db:migrate:dev`), nunca alterar BD manualmente |

---

## 7. Conventional Commits — OBLIGATORIO

### 7.1 Formato

```
type(scope): short description in english

What: Detailed description of what was done
For: Why this change is needed
Impact: What effect this has on the system
```

### 7.2 Tipos permitidos

| Tipo     | Uso                                                  |
| -------- | ---------------------------------------------------- |
| feat     | Nueva funcionalidad                                  |
| fix      | Corrección de bug                                    |
| docs     | Solo documentación                                   |
| style    | Formato, espacios, puntos y comas (no afecta lógica) |
| refactor | Reestructuración sin cambiar funcionalidad           |
| test     | Agregar o corregir tests                             |
| chore    | Tareas de mantenimiento, configuración, dependencias |
| ci       | Cambios en CI/CD                                     |
| perf     | Mejoras de rendimiento                               |

### 7.3 Scopes sugeridos

- `auth` — Autenticación y autorización
- `user` — Modelo/funcionalidad de usuario
- `db` — Base de datos y migraciones
- `api` — Endpoints y routers
- `ui` — Componentes y estilos del frontend
- `config` — Configuración y entorno
- `test` — Tests
- `deps` — Dependencias

### 7.4 Ejemplos

```bash
# ✅ Ejemplo de commit completo
git commit -m "feat(auth): add user registration endpoint

What: Creates POST /api/v1/auth/register with zod validation, bcrypt hashing and duplicate email check
For: Allow new users to create accounts in the NN Auth System
Impact: Enables the user onboarding flow; stores hashed passwords with bcrypt in the users table"

# ✅ Ejemplo de fix
git commit -m "fix(auth): handle expired refresh token gracefully

What: Returns 401 with clear error message when refresh token is expired
For: Prevent confusing 500 errors when users try to refresh after 7 days
Impact: Improves UX by redirecting to login instead of showing error page"
```

### 7.5 Estrategia de ramas — OBLIGATORIO

Este proyecto trabaja siempre con **dos ramas únicas**:

| Rama   | Propósito                                                     |
| ------ | ------------------------------------------------------------- |
| `main` | Código estable y verificado — solo recibe merges desde `dev`  |
| `dev`  | Rama de desarrollo activo — todos los commits nuevos van aquí |

#### Reglas de flujo

```bash
# Todo trabajo nuevo comienza desde dev
git checkout dev

# Commits del día a día → siempre sobre dev
git add .
git commit -m "feat(auth): ..."

# Cuando dev está estable y los tests pasan → merge a main
git checkout main
git merge dev --no-ff -m "chore(release): merge dev into main"
git checkout dev
```

- **NUNCA** hacer commits directamente en `main`
- **NUNCA** hacer `git push --force` en ninguna de las dos ramas
- `main` debe estar siempre en estado ejecutable (`pnpm dev` + `pnpm test` pasan)
- Los merges a `main` deben hacerse solo cuando `dev` tiene todos los tests en verde

---

## 8. Calidad — NO es Opcional, es OBLIGACIÓN

### 8.1 Principio fundamental

> **Código que se genera, código que se prueba.**

Cada función, endpoint, componente o utilidad que se cree debe tener su test correspondiente. No se considera "terminada" una feature hasta que sus tests pasen.

### 8.2 Testing — Backend

| Herramienta  | Uso                                    |
| ------------ | -------------------------------------- |
| vitest       | Framework principal de testing         |
| supertest    | Tests HTTP de integración para Express |
| pg (test DB) | Base de datos de pruebas aislada       |

```bash
# Ejecutar todos los tests del backend
cd be && pnpm test

# Ejecutar con cobertura
pnpm test:coverage

# Ejecutar un test específico
pnpm test src/tests/auth.test.ts
```

Cobertura mínima esperada: **80%** en módulos de lógica de negocio.

### 8.3 Testing — Frontend

| Herramienta            | Uso                             |
| ---------------------- | ------------------------------- |
| vitest                 | Test runner compatible con Vite |
| @testing-library/react | Testing de componentes React    |
| jsdom                  | Simular el DOM en Node.js       |

```bash
# Ejecutar todos los tests del frontend
cd fe && pnpm test

# Ejecutar en modo watch
pnpm test:watch

# Ejecutar con cobertura
pnpm test:coverage
```

### 8.4 Linting y Formateo

```bash
# Backend
cd be && pnpm lint          # Verificar errores
cd be && pnpm format        # Formatear código

# Frontend
cd fe && pnpm lint          # Verificar errores
cd fe && pnpm format        # Formatear código
```

### 8.5 Checklist antes de commit

- [ ] ¿El código tiene tipos TypeScript explícitos?
- [ ] ¿Hay comentarios pedagógicos (¿Qué? ¿Para qué? ¿Impacto?)?
- [ ] ¿Los tests pasan? (`pnpm test`)
- [ ] ¿El linter no reporta errores? (`pnpm lint`)
- [ ] ¿El commit sigue Conventional Commits con What/For/Impact?
- [ ] ¿Las variables sensibles están en `.env` y no hardcodeadas?
- [ ] ¿El `.env.example` se actualizó si se agregaron nuevas variables?
- [ ] **Si se agregó/actualizó un paquete:** ¿se auditó en security.snyk.io antes de instalar? (Regla 4.0)

---

## 9. Seguridad — Mejores Prácticas

### 9.1 Contraseñas

- SIEMPRE hashear con bcrypt (vía `bcryptjs`) antes de almacenar
- NUNCA almacenar contraseñas en texto plano
- NUNCA loggear contraseñas ni incluirlas en responses
- Validar fortaleza mínima: ≥8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número

### 9.2 JWT (Tokens)

- Access Token: corta duración (15 min) — se envía en header `Authorization: Bearer <token>`
- Refresh Token: larga duración (7 días) — se usa solo para obtener nuevos access tokens
- Secrets: mínimo 32 caracteres, aleatorios, en variables de entorno (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`)
- Algoritmo: HS256
- NUNCA almacenar tokens en `localStorage` en producción (usar httpOnly cookies o memoria)

### 9.3 CORS

- Configurar orígenes permitidos explícitamente con el paquete `cors`
- En desarrollo: permitir `http://localhost:5173`
- En producción: NUNCA usar `origin: "*"`

### 9.4 Headers de Seguridad

- Usar `helmet` en Express para configurar automáticamente headers seguros (X-Frame-Options, CSP, etc.)

### 9.5 Rate Limiting

- Aplicar `express-rate-limit` en todos los endpoints de auth para prevenir brute force
- Límite sugerido: 10 requests / 15 minutos en `/api/v1/auth/`

### 9.6 API

- Versionamiento: `/api/v1/...`
- Validación de inputs con zod (nunca confiar en datos del cliente)
- Mensajes de error genéricos en auth (no revelar si el email existe)
- Usar parámetros preparados siempre (Prisma Client los gestiona automáticamente)

### 9.7 Base de Datos

- Usar siempre Prisma Client (nunca raw SQL sin parametrizar)
- Conexiones con pool configurado (`pg.Pool`)
- Credenciales exclusivamente en variables de entorno

---

## 10. Estructura de la API

### 10.1 Prefijo base

Todos los endpoints van bajo `/api/v1/`

### 10.2 Endpoints de autenticación (`/api/v1/auth/`)

| Método | Ruta             | Descripción                           | Auth requerida |
| ------ | ---------------- | ------------------------------------- | -------------- |
| POST   | /register        | Registrar nuevo usuario               | No             |
| POST   | /login           | Iniciar sesión, obtener tokens        | No             |
| POST   | /refresh         | Renovar access token con refresh      | No (\*)        |
| POST   | /change-password | Cambiar contraseña (usuario logueado) | Sí             |
| POST   | /forgot-password | Solicitar email de recuperación       | No             |
| POST   | /reset-password  | Restablecer contraseña con token      | No (\*)        |

(\*) Requiere un token válido (refresh o reset), pero no el access token estándar.

### 10.3 Endpoints de usuario (`/api/v1/users/`)

| Método | Ruta | Descripción                       | Auth requerida |
| ------ | ---- | --------------------------------- | -------------- |
| GET    | /me  | Obtener perfil del usuario actual | Sí             |

---

## 11. Esquema de Base de Datos

### 11.1 Tabla `users`

| Columna         | Tipo         | Restricciones                 |
| --------------- | ------------ | ----------------------------- |
| id              | UUID         | PK, default gen_random_uuid() |
| email           | VARCHAR(255) | UNIQUE, NOT NULL, INDEXED     |
| full_name       | VARCHAR(255) | NOT NULL                      |
| hashed_password | VARCHAR(255) | NOT NULL                      |
| is_active       | BOOLEAN      | DEFAULT TRUE                  |
| created_at      | TIMESTAMP    | DEFAULT NOW(), NOT NULL       |
| updated_at      | TIMESTAMP    | DEFAULT NOW()                 |

### 11.2 Tabla `password_reset_tokens`

| Columna    | Tipo         | Restricciones                 |
| ---------- | ------------ | ----------------------------- |
| id         | UUID         | PK, default gen_random_uuid() |
| user_id    | UUID         | FK → users.id, NOT NULL       |
| token      | VARCHAR(255) | UNIQUE, NOT NULL, INDEXED     |
| expires_at | TIMESTAMP    | NOT NULL                      |
| used       | BOOLEAN      | DEFAULT FALSE                 |
| created_at | TIMESTAMP    | DEFAULT NOW(), NOT NULL       |

---

## 12. Flujos de Autenticación

### 12.1 Registro

```
Cliente → POST /api/v1/auth/register { email, full_name, password }
  → Validar datos (zod)
  → Verificar email no duplicado (Prisma query)
  → Hashear password (bcryptjs, rounds=12)
  → Insertar usuario en BD
  → Retornar usuario creado (sin password)
```

### 12.2 Login

```
Cliente → POST /api/v1/auth/login { email, password }
  → Buscar usuario por email
  → Verificar password contra hash
  → Generar access_token (15 min) + refresh_token (7 días)
  → Retornar { access_token, refresh_token, token_type: "bearer" }
```

### 12.3 Cambio de contraseña (usuario autenticado)

```
Cliente → POST /api/v1/auth/change-password { current_password, new_password }
  → (Requiere Authorization: Bearer <access_token>)
  → Verificar current_password contra hash
  → Hashear new_password
  → Actualizar en BD
  → Retornar confirmación
```

### 12.4 Recuperación de contraseña

```
Paso 1: Solicitar recuperación
Cliente → POST /api/v1/auth/forgot-password { email }
  → Buscar usuario por email
  → Generar token de reset (UUID + expiración 1 hora)
  → Guardar token en tabla password_reset_tokens
  → Enviar email con enlace: {FRONTEND_URL}/reset-password?token={token}
  → Retornar mensaje genérico (no revelar si el email existe)

Paso 2: Restablecer contraseña
Cliente → POST /api/v1/auth/reset-password { token, new_password }
  → Buscar token en BD
  → Verificar que no haya expirado ni sido usado
  → Hashear new_password
  → Actualizar password del usuario
  → Marcar token como usado
  → Retornar confirmación
```

---

## 13. Configuración de Docker Compose

```yaml
# Solo para desarrollo local — PostgreSQL 17 + Mailpit
services:
  db:
    image: postgres:17-alpine
    container_name: nn_auth_db
    environment:
      POSTGRES_USER: nn_user
      POSTGRES_PASSWORD: nn_password
      POSTGRES_DB: nn_auth_db
    ports:
      - "5432:5432"
    volumes:
      - nn_auth_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U nn_user -d nn_auth_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  mailpit:
    image: axllent/mailpit:latest
    container_name: nn_auth_mailpit
    ports:
      - "1025:1025" # SMTP
      - "8025:8025" # Web UI
    restart: unless-stopped

volumes:
  nn_auth_data:
```

### Alternativa sin Docker (PostgreSQL local)

Si no se dispone de Docker, instalar PostgreSQL 17 directamente en el sistema y crear la BD:

```sql
CREATE USER nn_user WITH PASSWORD 'nn_password';
CREATE DATABASE nn_auth_db OWNER nn_user;
GRANT ALL PRIVILEGES ON DATABASE nn_auth_db TO nn_user;
```

Para emails en desarrollo sin Docker, usar [Mailpit standalone](https://mailpit.axllent.org/docs/install/).

---

## 14. Mejores Prácticas — Resumen

### 14.1 Generales

- ✅ DRY (Don't Repeat Yourself) — reutilizar código
- ✅ KISS (Keep It Simple, Stupid) — preferir soluciones simples
- ✅ YAGNI (You Aren't Gonna Need It) — no agregar lo que no se necesita aún
- ✅ Separation of Concerns — cada módulo tiene una responsabilidad clara
- ✅ Fail fast — validar inputs al inicio de cada operación (zod)
- ✅ Defensive programming — manejar errores explícitamente

### 14.2 Backend (Express)

- ✅ Separar router → controller → service → db (capas claras)
- ✅ Controller solo maneja HTTP (req/res), delega lógica al service
- ✅ Usar zod para toda validación de entrada
- ✅ Lanzar errores tipados (AppError, ConflictError, UnauthorizedError)
- ✅ Capturar todos los errores en el `error.middleware.ts` global
- ✅ Usar tipos de retorno explícitos en todas las funciones
- ✅ Documentar endpoints con comentarios claros

### 14.3 Frontend

- ✅ Componentes pequeños y reutilizables
- ✅ Estado global solo cuando es necesario (Context API para auth)
- ✅ Custom hooks para encapsular lógica reutilizable
- ✅ Rutas protegidas con componente `ProtectedRoute`
- ✅ Manejo de errores con feedback visual al usuario
- ✅ Loading states para operaciones asíncronas

### 14.4 Diseño y UX/UI — OBLIGATORIO

| Aspecto           | Regla                                                                    |
| ----------------- | ------------------------------------------------------------------------ |
| Temas             | Dark mode y Light mode con toggle — class-based (`@custom-variant dark`) |
| Dark palette      | `slate-*` — tiene subtono azul, da identidad al dark mode                |
| Tipografía        | Fuentes sans-serif exclusivamente (Inter, system-ui)                     |
| Colores           | Sólidos y planos — SIN degradados (gradient) en ningún lugar             |
| Color de acento   | Usar siempre `brand-*` — NUNCA hardcodear `blue-*` u otro color          |
| Estilo visual     | Diseño moderno, limpio, minimalista con excelente UX/UI                  |
| Botones de acción | Siempre alineados a la derecha (`justify-end`)                           |
| Spacing           | Usar escala consistente de Tailwind (p-4, gap-6, space-y-4)              |
| Bordes            | Sutiles (`border border-gray-200 dark:border-slate-700`)                 |
| Transiciones      | Suaves en hover/focus (`transition-colors duration-200`)                 |
| Responsividad     | Mobile-first — los formularios de auth deben verse bien en móvil         |
| Accesibilidad     | Labels en inputs, aria-\* básicos, contraste suficiente (WCAG AA)        |

#### Sistema de color de marca — `brand-*`

El FE usa variables CSS `brand-{400,500,600,800}` en lugar de un color hardcodeado.
Cada stack del sistema educativo tiene un color de acento único para identificación visual inmediata.

| Stack                  | Proyecto              | Color Tailwind | Shades en `@theme`       |
| ---------------------- | --------------------- | -------------- | ------------------------ |
| **Express.js**         | `proyecto-beex-fe`    | `blue`         | `var(--color-blue-*)`    |
| **FastAPI**            | `proyecto-be_fastapi-fe_react` | `emerald`      | `var(--color-emerald-*)` |
| **Next.js fullstack**  | `proyecto-be-fe-next` | `violet`       | `var(--color-violet-*)`  |
| **Spring Boot Java**   | `proyecto-besb-fe`    | `amber`        | `var(--color-amber-*)`   |
| **Spring Boot Kotlin** | `proyecto-besbk-fe`   | `fuchsia`      | `var(--color-fuchsia-*)` |
| **Go REST API**        | `proyecto-bego-fe`    | `cyan`         | `var(--color-cyan-*)`    |

Para adaptar el FE a otro stack, **solo cambia el bloque `@theme` en `fe/src/index.css`**:

```css
/* Express.js → blue */
@theme {
  --color-brand-400: var(--color-blue-400);
  --color-brand-500: var(--color-blue-500);
  --color-brand-600: var(--color-blue-600);
  --color-brand-800: var(--color-blue-800);
}

/* FastAPI → emerald */
@theme {
  --color-brand-400: var(--color-emerald-400);
  --color-brand-500: var(--color-emerald-500);
  --color-brand-600: var(--color-emerald-600);
  --color-brand-800: var(--color-emerald-800);
}
```

```tsx
// ✅ CORRECTO — usa brand-* para que cambie con el stack
<button className="bg-brand-600 hover:bg-brand-700 text-white ...">
  Guardar
</button>

// ❌ INCORRECTO — color hardcodeado, rompe el sistema de marca
<button className="bg-blue-600 hover:bg-blue-700 text-white ...">
  Guardar
</button>
```

Ver guía completa: [`docs/referencia-tecnica/design-system.md`](../docs/referencia-tecnica/design-system.md)

---

## 15. Reglas para Copilot / IA — Al Generar Código

1. **Dividir respuestas largas** — Si la implementación es extensa, dividirla en pasos incrementales.
2. **Código generado = código probado** — Siempre incluir o sugerir tests para lo que se genere.
3. **Comentarios pedagógicos** — Cada bloque significativo debe tener comentarios con ¿Qué? ¿Para qué? ¿Impacto?
4. **Tipos obligatorios** — Nunca omitir tipado en TypeScript (ni en BE ni en FE).
5. **Formato correcto** — Respetar ESLint/Prettier en todo el código generado.
6. **Usar las herramientas correctas** — `pnpm` para Node.js. Sin excepciones.
7. **Variables de entorno** — Toda configuración sensible va en `.env`, nunca hardcodeada.
8. **Conventional Commits** — Sugerir mensajes de commit con formato correcto.
9. **Seguridad primero** — Nunca almacenar passwords en texto plano, nunca exponer secrets.
10. **Legibilidad sobre cleverness** — El código debe ser entendible para un aprendiz.
11. **Auditoría antes de sugerir `pnpm add`** — Antes de recomendar la instalación de cualquier paquete, verificar en `security.snyk.io` que la versión no tenga CVEs. Indicar siempre la versión exacta verificada, nunca rangos `^` ni `~`. Si hay CVEs en la última versión, señalar la última versión segura disponible.

---

## 16. Plan de Trabajo — Fases

> Cada fase es independiente y verificable. No avanzar a la siguiente sin completar y probar la actual.

### Fase 0 — Fundamentos y Configuración Base

- [ ] Crear `.github/copilot-instructions.md` (este archivo)
- [ ] Crear `.gitignore` raíz
- [ ] Crear `docker-compose.yml` con PostgreSQL 17 + Mailpit
- [ ] Crear `README.md` con descripción, stack, prerrequisitos y setup

### Fase 1 — Backend Setup

- [ ] Inicializar proyecto Node.js/TypeScript en `be/`
- [ ] Instalar dependencias con `pnpm`
- [ ] Crear `src/config.ts` — validación de env vars con zod
- [ ] Crear `src/db/index.ts` — Prisma Client con `@prisma/adapter-pg`
- [ ] Crear `prisma/schema.prisma` — tablas con Prisma
- [ ] Configurar `prisma.config.ts`
- [ ] Crear `src/app.ts` — Express con middlewares (helmet, cors, rate-limit)
- [ ] Crear `src/index.ts` — arranque del servidor
- [ ] Crear `.env.example` y `.env`
- [ ] ✅ Verificar: `pnpm dev` → servidor corriendo en `http://localhost:3000`

### Fase 2 — Migraciones de Base de Datos

- [ ] Ejecutar `pnpm db:migrate:dev` — generar y aplicar la migración inicial
- [ ] ✅ Verificar: tablas `users` y `password_reset_tokens` creadas en PostgreSQL

### Fase 3 — Autenticación Backend

- [ ] Crear `src/utils/security.ts` — hashing bcrypt + JWT
- [ ] Crear `src/utils/email.ts` — envío de email con nodemailer
- [ ] Crear `src/middlewares/auth.middleware.ts` — verificar JWT
- [ ] Crear `src/middlewares/validate.middleware.ts` — validar con zod
- [ ] Crear `src/middlewares/error.middleware.ts` — manejador global
- [ ] Crear módulo `auth` (router, controller, service, schema)
- [ ] Crear módulo `users` (router, controller, service)
- [ ] ✅ Verificar: probar todos los endpoints con curl o Postman/Insomnia

### Fase 4 — Tests Backend

- [ ] Configurar vitest + supertest
- [ ] Crear `src/tests/setup.ts` — configuración global
- [ ] Crear `src/tests/auth.test.ts` — tests completos
- [ ] ✅ Verificar: `pnpm test` → todos los tests pasan (cobertura ≥80%)

### Fase 5 — Frontend Setup

- [ ] Inicializar proyecto Vite con React + TypeScript en `fe/`
- [ ] Instalar dependencias con `pnpm`
- [ ] Configurar TailwindCSS 4
- [ ] Configurar TypeScript strict mode
- [ ] Crear `.env.example`
- [ ] ✅ Verificar: `pnpm dev` → app base visible en `http://localhost:5173`

### Fase 6 — Frontend Auth

- [ ] Crear tipos TypeScript (`types/auth.ts`)
- [ ] Crear cliente HTTP (`api/auth.ts`)
- [ ] Crear AuthContext + Provider
- [ ] Crear hook `useAuth`
- [ ] Crear componentes UI (InputField, Button, Alert, ProtectedRoute)
- [ ] Crear `LandingPage.tsx` — página pública en ruta `/`
- [ ] Crear páginas de auth: Login, Register, Dashboard, ChangePassword, ForgotPassword, ResetPassword
- [ ] Crear páginas legales: TerminosDeUso, PoliticaPrivacidad, PoliticaCookies
- [ ] Crear `ContactPage.tsx`
- [ ] Configurar rutas en `App.tsx`
- [ ] ✅ Verificar: flujo completo funciona contra la API

### Fase 7 — Tests Frontend

- [ ] Configurar Vitest + Testing Library
- [ ] Crear tests para componentes y flujos de auth
- [ ] ✅ Verificar: `pnpm test` → todos los tests pasan

### Fase 8 — Documentación Final

- [ ] Completar `docs/referencia-tecnica/architecture.md`
- [ ] Completar `docs/referencia-tecnica/api-endpoints.md`
- [ ] Completar `docs/referencia-tecnica/database-schema.md`
- [ ] Completar documentos de conceptos y requisitos
- [ ] Actualizar `README.md` con instrucciones finales

---

## 17. Verificación Final del Sistema

```bash
# 1. Levantar base de datos y email (con Docker)
docker compose up -d

# 2. Levantar backend (Express)
cd be && pnpm dev
# → API disponible en http://localhost:3000
# → Health check en http://localhost:3000/health

# 3. Levantar frontend (React + Vite)
cd fe && pnpm dev
# → App disponible en http://localhost:5173

# 4. Ejecutar tests backend
cd be && pnpm test

# 5. Ejecutar tests frontend
cd fe && pnpm test

# 6. Flujo manual completo:
#    Registro → Login → Ver perfil → Cambiar contraseña →
#    Logout → Forgot password → Reset password → Login con nueva contraseña
#    📧 Mailpit — revisar emails capturados en http://localhost:8025
```

> Recuerda: **La calidad no es una opción, es una obligación.** Cada línea de código es una oportunidad de aprender y enseñar.
