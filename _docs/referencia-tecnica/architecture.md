# Arquitectura del Sistema — NN Auth System (Express Edition)

## 1. Visión General

NN Auth System es una aplicación web de autenticación construida con arquitectura **cliente-servidor** desacoplada:

- **Frontend**: React + Vite, se comunica con el backend exclusivamente vía HTTP (REST API)
- **Backend**: Express.js + TypeScript, expone una API REST versionada
- **Base de datos**: PostgreSQL 17, accedida exclusivamente a través de Drizzle ORM
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
│             Node.js 20 + TypeScript + Drizzle            │
│                   localhost:3000                         │
│                                                          │
│  helmet │ cors │ rate-limit │ zod │ jsonwebtoken │ bcrypt │
└───────────────────────┬─────────────────────────────────┘
                        │ pg driver (pool)
                        ▼
┌─────────────────────────────────────────────────────────┐
│               BASE DE DATOS (PostgreSQL 17)              │
│                   localhost:5432                         │
│          Tablas: users, password_reset_tokens            │
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
│   ice.ts)   │  Lanza errores tipados ante condiciones inválidas
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Drizzle DB │  Consultas type-safe a PostgreSQL
│  (db/index  │  Nunca SQL crudo sin parametrizar
│      .ts)   │
└─────────────┘
```

### 2.1 Middlewares globales (en orden de ejecución)

| Middleware | Propósito |
|---|---|
| `helmet` | Headers de seguridad HTTP |
| `cors` | Control de orígenes permitidos |
| `express.json()` | Parsing de body JSON |
| `rateLimit` | Límite de requests en rutas de auth |
| `validate` | Validación de body/params con zod |
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
| `/dashboard` | `DashboardPage` | Sí |
| `/change-password` | `ChangePasswordPage` | Sí |
| `/forgot-password` | `ForgotPasswordPage` | No |
| `/reset-password` | `ResetPasswordPage` | No (*) |
| `/contacto` | `ContactPage` | No |
| `/terminos-de-uso` | `TerminosDeUsoPage` | No |
| `/privacidad` | `PoliticaPrivacidadPage` | No |
| `/cookies` | `PoliticaCookiesPage` | No |

(*) Requiere token de reset en query param `?token=...`

---

## 4. Flujo de Autenticación — Diagrama de Secuencia

### 4.1 Login

```
Usuario       Frontend           Backend              BD
  │               │                  │                 │
  │──[email+pass]─▶               │                 │
  │               │──POST /login──▶               │
  │               │                  │──SELECT user──▶ │
  │               │                  │◀──user row─────  │
  │               │                  │  verify bcrypt  │
  │               │                  │  sign JWT tokens│
  │               │◀─{access,refresh}─               │
  │               │  store en memory │                 │
  │◀──[redirect]──               │                 │
```

### 4.2 Request autenticado

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

## 5. Modelo de Datos — Diagrama ER

```
┌──────────────────────────────┐
│           users              │
├──────────────────────────────┤
│ id           UUID  PK        │
│ email        VARCHAR(255) UQ │
│ full_name    VARCHAR(255)    │
│ hashed_pass  VARCHAR(255)    │
│ is_active    BOOLEAN         │
│ created_at   TIMESTAMP       │
│ updated_at   TIMESTAMP       │
└──────────────┬───────────────┘
               │ 1
               │
               │ N
┌──────────────▼───────────────┐
│    password_reset_tokens     │
├──────────────────────────────┤
│ id           UUID  PK        │
│ user_id      UUID  FK        │
│ token        VARCHAR(255) UQ │
│ expires_at   TIMESTAMP       │
│ used         BOOLEAN         │
│ created_at   TIMESTAMP       │
└──────────────────────────────┘
```

---

## 6. Decisiones Técnicas

### 6.1 ¿Por qué Express.js en lugar de FastAPI?

Este proyecto es la versión Express del mismo sistema implementado con FastAPI en Python. El objetivo educativo es:
- Aprender el mismo dominio (autenticación) con dos stacks diferentes
- Comparar los enfoques: decoradores de FastAPI vs middlewares de Express
- Entender cómo Node.js maneja el I/O asíncrono (event loop vs async/await de Python)

### 6.2 ¿Por qué Drizzle ORM y no Prisma/TypeORM?

| Criterio | Drizzle | Prisma | TypeORM |
|---|---|---|---|
| Type safety | ✅ Total | ✅ Buena | ⚠️ Parcial |
| Bundle size | ✅ Ligero | ⚠️ Pesado | ⚠️ Medio |
| SQL cercano | ✅ Sí | ❌ No | ⚠️ Parcial |
| Migraciones | ✅ drizzle-kit | ✅ prisma migrate | ✅ Sí |
| Aprendizaje SQL | ✅ Refuerza | ❌ Abstrae | ⚠️ Parcial |

Drizzle refuerza el entendimiento de SQL — clave en un contexto educativo.

### 6.3 ¿Por qué stateless JWT y no sesiones?

- Simplicidad: no requiere almacenamiento de sesiones en BD
- Escalabilidad: cualquier instancia del backend puede verificar el token
- Demostración educativa: implementar el ciclo completo de access + refresh tokens

### 6.4 ¿Por qué dos tokens (access + refresh)?

- **Access token** (15 min): corta duración minimiza el riesgo si es interceptado
- **Refresh token** (7 días): permite renovar el acceso sin re-autenticarse
- Patrón real usado por la industria — valioso aprenderlo desde el principio

---

## 7. Consideraciones de Despliegue (referencia)

> Este proyecto es de desarrollo/educativo. Las notas a continuación son orientativas.

| Componente | Opción dev | Opción producción |
|---|---|---|
| Backend | `pnpm dev` (tsx watch) | `pnpm build` + `node dist/index.js` |
| Frontend | `pnpm dev` (Vite HMR) | `pnpm build` → servir `dist/` con Nginx |
| Base de datos | Docker Compose local | Neon, Supabase, Railway, RDS |
| Email | Mailpit local | Resend, SendGrid, SES |
| Variables de entorno | `.env` local | Secrets del proveedor cloud |
