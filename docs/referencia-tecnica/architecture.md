# Arquitectura del Sistema — NN Auth System (Express Edition)

<!--
  ¿Qué? Documento de arquitectura general del sistema.
  ¿Para qué? Proveer una visión macro de cómo se relacionan las capas, flujos y decisiones técnicas.
  ¿Impacto? Entender la arquitectura es prerequisito para contribuir correctamente al proyecto.
-->

## 1. Visión General

NN Auth System es una aplicación web de autenticación construida con arquitectura **cliente-servidor** desacoplada:

- **Frontend**: React + Vite, se comunica con el backend exclusivamente vía HTTP (REST API)
- **Backend**: Express.js + TypeScript, expone una API REST versionada
- **Base de datos**: PostgreSQL 17, accedida exclusivamente a través de Prisma ORM
- **Email (dev)**: Mailpit captura los emails SMTP localmente para pruebas

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENTE (Browser)                    │
│            React 18 + Vite + TypeScript                  │
│                   localhost:5173                         │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP (Axios)
                        │ Authorization: Bearer <token>
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  BACKEND (Express.js)                    │
│             Node.js 20 + TypeScript + Prisma             │
│                   localhost:3000                         │
│                                                          │
│  helmet │ cors │ rate-limit │ zod │ jsonwebtoken │ bcrypt │
│                   audit-log (security events)            │
└───────────────────────┬─────────────────────────────────┘
                        │ pg driver (pool)
                        ▼
┌─────────────────────────────────────────────────────────┐
│               BASE DE DATOS (PostgreSQL 17)              │
│                   localhost:5432                         │
│  Tablas: users, password_reset_tokens,                   │
│          email_verification_tokens                       │
└─────────────────────────────────────────────────────────┘
                        
┌─────────────────────────────────────────────────────────┐
│               EMAIL DEV (Mailpit)                        │
│         SMTP: localhost:1025 │ UI: localhost:8025        │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Arquitectura del Backend — Capas

El backend sigue el patrón **Router → Controller → Service → DB** con responsabilidades claras por capa:

```
HTTP Request
     │
     ▼
┌─────────────┐
│   Router    │  Define rutas y aplica middlewares específicos
│ (auth.router│  No contiene lógica de negocio
│      .ts)   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Controller │  Recibe req/res, extrae datos, llama al service
│(auth.cont-  │  Retorna respuesta HTTP con status code correcto
│ roller.ts)  │  NO contiene lógica de negocio
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Service   │  Contiene toda la lógica de negocio
│(auth.serv-  │  Orquesta llamadas a la BD, hashing, JWT, email
│   ice.ts)   │  Llama a audit-log para registrar eventos
│             │  Lanza errores tipados ante condiciones inválidas
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Prisma DB  │  Consultas type-safe a PostgreSQL
│  (db/index  │  Nunca SQL crudo sin parametrizar
│      .ts)   │
└─────────────┘

       │ (paralelo con Service)
       ▼
┌─────────────┐
│  Audit Log  │  Registra eventos de seguridad (OWASP A09)
│(utils/audit │  LOGIN_SUCCESS, LOGIN_FAILED, EMAIL_VERIFIED,
│   -log.ts)  │  PASSWORD_CHANGED, PASSWORD_RESET_REQUESTED
└─────────────┘
```

### 2.1 Middlewares globales (en orden de ejecución)

| Middleware | Propósito |
|---|---|
| `helmet` | Headers de seguridad HTTP |
| `cors` | Control de orígenes permitidos |
| `express.json()` | Parsing de body JSON |
| `rateLimit` | Límite de requests en rutas de auth |
| `validate` | Validación de body/params con Zod |
| `auth` | Verificación de JWT (solo rutas protegidas) |
| `errorHandler` | Captura global de errores — último middleware |

---

## 3. Arquitectura del Frontend

### 3.1 Estructura de capas

```
┌──────────────────────────────────────────┐
│              Páginas (Pages)             │
│  LandingPage, LoginPage, DashboardPage…  │
│  Composición de componentes + lógica UI  │
└──────────────────┬───────────────────────┘
                   │ usa
                   ▼
┌──────────────────────────────────────────┐
│           Componentes (Components)       │
│  InputField, Button, Alert, ProtectedRoute│
│  Reutilizables, sin estado global        │
└──────────────────┬───────────────────────┘
                   │ usa
                   ▼
┌──────────────────────────────────────────┐
│         Custom Hooks + Context           │
│  useAuth() — estado de autenticación     │
│  AuthContext — provider global           │
│  useTheme() — dark/light mode            │
│  i18n (useTranslation) — idioma          │
└──────────────────┬───────────────────────┘
                   │ llama
                   ▼
┌──────────────────────────────────────────┐
│            API Layer (api/auth.ts)       │
│  Funciones Axios por endpoint            │
│  Maneja headers, tokens, errores HTTP    │
└──────────────────┬───────────────────────┘
                   │ HTTP
                   ▼
              Backend API
```

### 3.2 Gestión del estado de autenticación

```
AuthContext (Provider en App.tsx)
    │
    ├── user: UserResponse | null
    ├── accessToken: string | null
    ├── isLoading: boolean
    ├── login(email, password) → Promise<void>
    ├── register(data) → Promise<void>
    ├── logout() → void
    └── refreshToken() → Promise<void>
    
useAuth() ← hook que consume AuthContext
```

### 3.3 Enrutamiento

| Ruta | Componente | Protegida |
|---|---|---|
| `/` | `LandingPage` | No |
| `/login` | `LoginPage` | No |
| `/register` | `RegisterPage` | No |
| `/verify-email` | `VerifyEmailPage` | No (*) |
| `/dashboard` | `DashboardPage` | Sí |
| `/change-password` | `ChangePasswordPage` | Sí |
| `/forgot-password` | `ForgotPasswordPage` | No |
| `/reset-password` | `ResetPasswordPage` | No (**) |
| `/contacto` | `ContactPage` | No |
| `/terminos-de-uso` | `TerminosDeUsoPage` | No |
| `/privacidad` | `PoliticaPrivacidadPage` | No |
| `/cookies` | `PoliticaCookiesPage` | No |

(*) Requiere `?token=...` en query param para activar la cuenta
(**) Requiere `?token=...` de reset en query param

---

## 4. Flujos de Autenticación — Diagramas de Secuencia

### 4.1 Registro + Verificación de Email

```
Usuario       Frontend           Backend              BD         Email
  │               │                  │                 │            │
  │──[datos]──────▶               │                 │            │
  │               │──POST /register─▶               │            │
  │               │                  │──INSERT user──▶ │            │
  │               │                  │  is_email_verified=false    │
  │               │                  │──INSERT token─▶ │            │
  │               │                  │  expires_at=+24h            │
  │               │                  │─────────────────────────────▶
  │               │                  │                sendEmail()  │
  │               │◀─{201, user}──────               │            │
  │◀──[mensaje:   │                  │                 │            │
  │   verifica tu │                  │                 │            │
  │   email]──────│                  │                 │            │
  │               │                  │                 │            │
  │──[clic enlace]▶               │                 │            │
  │               │──POST /verify-───▶               │            │
  │               │   email {token}  │──UPDATE user──▶ │            │
  │               │                  │  is_email_verified=true     │
  │               │                  │──UPDATE token─▶ │            │
  │               │                  │  used=true                  │
  │               │◀─{200, success}───               │            │
  │◀──[redirect   │                  │                 │            │
  │    to login]──│                  │                 │            │
```

### 4.2 Login

```
Usuario       Frontend           Backend              BD
  │               │                  │                 │
  │──[email+pass]─▶               │                 │
  │               │──POST /login──▶               │
  │               │                  │──SELECT user──▶ │
  │               │                  │◀──user row─────  │
  │               │                  │  verify bcrypt  │
  │               │                  │  check is_email_verified │
  │               │                  │  sign JWT tokens│
  │               │                  │  audit: LOGIN_SUCCESS    │
  │               │◀─{access,refresh}─               │
  │               │  store en memory │                 │
  │◀──[redirect]──               │                 │
```

### 4.3 Request autenticado

```
Usuario       Frontend           Backend              BD
  │               │                  │                 │
  │──[acción]─────▶               │                 │
  │               │──GET /me──────▶               │
  │               │  Authorization:  │                 │
  │               │  Bearer <token>  │                 │
  │               │                  │  verify JWT     │
  │               │                  │──SELECT user──▶ │
  │               │                  │◀──user data────  │
  │               │◀──{user}──────────               │
  │◀──[datos]─────               │                 │
```

---

## 5. Seguridad — Capas de Defensa

### 5.1 Capas implementadas

| Capa | Mecanismo | Cobertura |
|---|---|---|
| Inputs | Zod validation | Todos los endpoints |
| Contraseñas | bcryptjs (salt=12) | Registro y cambio de pass |
| Tokens | JWT HS256 (access 15m + refresh 7d) | Autenticación |
| Headers HTTP | helmet | Toda la API |
| CORS | Orígenes explícitos | Toda la API |
| Rate limiting | express-rate-limit | Endpoints de auth |
| SQL injection | Prisma ORM (parametrizado) | Toda la BD |
| Auditoria | audit-log.ts (JSON estructurado) | Eventos de seguridad |
| Email verification | email_verification_tokens | Previene cuentas falsas |

### 5.2 Módulo de auditoría (`utils/audit-log.ts`)

Registra eventos de seguridad en formato JSON estructurado (OWASP A09):

```typescript
// Ejemplo de evento de auditoría
{
  timestamp: "2026-03-22T10:00:00.000Z",
  event: "LOGIN_SUCCESS",
  userId: "550e8400-...",
  ip: "192.168.1.1"
}
```

Eventos registrados:
- `LOGIN_SUCCESS` — login exitoso
- `LOGIN_FAILED` — login fallido (email no existe o contraseña incorrecta)
- `PASSWORD_CHANGED` — cambio de contraseña exitoso
- `PASSWORD_RESET_REQUESTED` — solicitud de recuperación de contraseña
- `EMAIL_VERIFIED` — verificación de email exitosa
- `RATE_LIMIT_HIT` — límite de velocidad alcanzado

---

## 6. Modelo de Datos — Resumen

```
┌──────────────────────────────────┐
│              users               │
├──────────────────────────────────┤
│ id                UUID  PK       │
│ email             VARCHAR(255) UQ│
│ full_name         VARCHAR(255)   │
│ hashed_password   VARCHAR(255)   │
│ is_email_verified BOOLEAN        │
│ locale            VARCHAR(10)    │
│ is_active         BOOLEAN        │
│ created_at        TIMESTAMP      │
│ updated_at        TIMESTAMP      │
└──────┬────────────────┬──────────┘
       │ 1              │ 1
       │ N              │ N
┌──────▼────────┐  ┌───▼──────────────────┐
│ password_reset│  │ email_verification_  │
│    _tokens    │  │      tokens          │
├───────────────┤  ├──────────────────────┤
│ id  UUID PK   │  │ id        UUID PK    │
│ user_id FK    │  │ user_id   FK         │
│ token         │  │ token                │
│ expires_at    │  │ expires_at           │
│ used          │  │ used                 │
│ created_at    │  │ created_at           │
└───────────────┘  └──────────────────────┘
```

---

## 7. Decisiones Técnicas

### 7.1 ¿Por qué Express.js en lugar de FastAPI?

Este proyecto es la versión Express del mismo sistema implementado con FastAPI en Python. El objetivo educativo es:
- Aprender el mismo dominio (autenticación) con dos stacks diferentes
- Comparar los enfoques: decoradores de FastAPI vs middlewares de Express
- Entender cómo Node.js maneja el I/O asíncrono (event loop vs async/await de Python)

### 7.2 ¿Por qué Prisma ORM y no Drizzle/TypeORM?

| Criterio | Prisma | Drizzle | TypeORM |
|---|---|---|---|
| Type safety | ✅ Total (tipos generados) | ✅ Total | ⚠️ Parcial |
| Migraciones declarativas | ✅ `schema.prisma` + `prisma migrate` | ✅ drizzle-kit | ✅ Sí |
| Herramientas (Studio, `$transaction`) | ✅ Completas | ⚠️ Más limitadas | ⚠️ Parcial |
| Curva de aprendizaje | ✅ API declarativa, fácil de leer | ⚠️ Requiere pensar en query-builder | ⚠️ Parcial |
| SQL crudo cuando hace falta | ✅ `$queryRaw` parametrizado | ✅ Sí | ✅ Sí |

Se migró de Drizzle a Prisma el 2026-08-14 (ver [`AUDITORIA.md`](../../AUDITORIA.md) —
sección "Auditoría de CVEs"): la versión de Drizzle usada tenía un CVE de SQL injection sin
parchear (GHSA-gpj5-g38j-94v9). Como beneficio pedagógico adicional, Prisma es el ORM más
usado en el ecosistema Node.js/TypeScript — mayor transferencia de conocimiento fuera de este
proyecto que un query-builder menos extendido.

### 7.3 ¿Por qué stateless JWT y no sesiones?

- Simplicidad: no requiere almacenamiento de sesiones en BD
- Escalabilidad: cualquier instancia del backend puede verificar el token
- Demostración educativa: implementar el ciclo completo de access + refresh tokens

### 7.4 ¿Por qué verificación de email obligatoria?

- Previene el registro de cuentas con emails ajenos (suplantación)
- Garantiza que el email es accesible por el usuario (necesario para recuperación de contraseña)
- Refleja el comportamiento de sistemas de producción reales

---

## 8. Consideraciones de Despliegue (referencia)

> Este proyecto es de desarrollo/educativo. Las notas a continuación son orientativas.

| Componente | Opción dev | Opción producción |
|---|---|---|
| Backend | `pnpm dev` (tsx watch) | `pnpm build` + `node dist/index.js` |
| Frontend | `pnpm dev` (Vite HMR) | `pnpm build` → servir `dist/` con Nginx |
| Base de datos | Docker Compose local | Neon, Supabase, Railway, RDS |
| Email | Mailpit local | Resend, SendGrid, SES |
| Variables de entorno | `.env` local | Secrets del proveedor cloud |

---
