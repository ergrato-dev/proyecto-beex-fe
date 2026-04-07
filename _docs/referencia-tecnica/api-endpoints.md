# API Endpoints — NN Auth System (Express Edition)

<!--
  ¿Qué? Documentación de referencia de todos los endpoints disponibles en la API.
  ¿Para qué? Servir como contrato entre frontend y backend, y guía de implementación.
  ¿Impacto? Cualquier cambio en la API debe reflejarse aquí antes (o simultáneamente) a la implementación.
-->

## Información General

| Campo | Valor |
|---|---|
| Base URL (desarrollo) | `http://localhost:3000` |
| Prefijo de versión | `/api/v1` |
| Formato de datos | `application/json` |
| Autenticación | `Authorization: Bearer <access_token>` |
| Rate limiting | 10 req / 15 min en `/api/v1/auth/` |

---

## Resumen de Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/health` | No | Health check |
| POST | `/api/v1/auth/register` | No | Registro de nuevo usuario |
| POST | `/api/v1/auth/verify-email` | No | Verificación de email |
| POST | `/api/v1/auth/login` | No | Login y emisión de tokens |
| POST | `/api/v1/auth/refresh` | No† | Renovación de tokens |
| POST | `/api/v1/auth/change-password` | Sí | Cambio de contraseña |
| POST | `/api/v1/auth/forgot-password` | No | Solicitar recuperación |
| POST | `/api/v1/auth/reset-password` | No | Restablecer contraseña |
| GET | `/api/v1/users/me` | Sí | Perfil del usuario |
| PATCH | `/api/v1/users/me/locale` | Sí | Actualizar idioma preferido |

† Requiere `refreshToken` en el body.

---

## Health Check

### `GET /health`

Verifica que el servidor está activo.

**No requiere autenticación.**

**Respuesta 200:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-22T10:00:00.000Z"
}
```

---

## Autenticación — `/api/v1/auth`

### `POST /api/v1/auth/register`

Registra un nuevo usuario. Envía un email de verificación automáticamente.
La cuenta queda inactiva (`isEmailVerified: false`) hasta que el usuario verifique su email.

**No requiere autenticación.**

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "fullName": "Juan Pérez",
  "password": "MiPassword123"
}
```

**Validaciones (Zod):**
- `email`: formato email válido, requerido
- `fullName`: string, mínimo 2 caracteres, máximo 100, requerido
- `password`: mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número

**Respuesta 201:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "usuario@ejemplo.com",
  "fullName": "Juan Pérez",
  "isEmailVerified": false,
  "locale": "es",
  "createdAt": "2026-03-22T10:00:00.000Z"
}
```

**Errores:**
| Código | Descripción |
|---|---|
| 409 | El email ya está registrado |
| 422 | Datos de entrada inválidos (Zod validation error) |
| 500 | Error interno del servidor |

---

### `POST /api/v1/auth/verify-email`

Valida el token de verificación de email y activa la cuenta del usuario.

**No requiere autenticación.**

**Body:**
```json
{
  "token": "abc123def456..."
}
```

**Respuesta 200:**
```json
{
  "success": true,
  "message": "Email verificado correctamente. Ya puedes iniciar sesión."
}
```

**Errores:**
| Código | Descripción |
|---|---|
| 400 | Token inválido, expirado o ya utilizado |
| 422 | Body inválido (token faltante) |
| 500 | Error interno del servidor |

> ℹ️ El token expira en 24 horas desde el registro. Cada token es de un solo uso.

---

### `POST /api/v1/auth/login`

Inicia sesión y retorna los tokens de acceso. Requiere que el email esté verificado.

**No requiere autenticación.**

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "MiPassword123"
}
```

**Respuesta 200:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "usuario@ejemplo.com",
    "fullName": "Juan Pérez",
    "isEmailVerified": true,
    "locale": "es",
    "createdAt": "2026-03-22T10:00:00.000Z"
  }
}
```

**Errores:**
| Código | Descripción |
|---|---|
| 401 | Credenciales incorrectas (mensaje genérico) |
| 403 | Email no verificado — debe activar la cuenta primero |
| 422 | Datos de entrada inválidos |
| 429 | Rate limit excedido |
| 500 | Error interno del servidor |

> ⚠️ Seguridad: el mensaje de error 401 NO revela si el email existe. Siempre devuelve "Invalid credentials".

---

### `POST /api/v1/auth/refresh`

Renueva el par de tokens (access + refresh). Implementa rotación de tokens.

**Requiere refresh token válido en el body (no en el header).**

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta 200:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "bearer"
}
```

**Errores:**
| Código | Descripción |
|---|---|
| 401 | Refresh token inválido o expirado |
| 422 | Body inválido |
| 500 | Error interno del servidor |

> ℹ️ Rotación de tokens: cada llamada exitosa a `/refresh` genera un **nuevo** `refreshToken`. El anterior queda obsoleto.

---

### `POST /api/v1/auth/change-password`

Cambia la contraseña del usuario autenticado, verificando primero la contraseña actual.

**Requiere autenticación** — `Authorization: Bearer <access_token>`

**Body:**
```json
{
  "currentPassword": "MiPasswordActual123",
  "newPassword": "MiNuevoPassword456"
}
```

**Validaciones:**
- `currentPassword`: requerido
- `newPassword`: mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número
- `newPassword` no puede ser igual a `currentPassword`

**Respuesta 200:**
```json
{
  "success": true,
  "message": "Contraseña cambiada correctamente."
}
```

**Errores:**
| Código | Descripción |
|---|---|
| 400 | Nueva contraseña igual a la actual |
| 401 | No autenticado o contraseña actual incorrecta |
| 422 | Datos de entrada inválidos |
| 500 | Error interno del servidor |

---

### `POST /api/v1/auth/forgot-password`

Solicita el envío de un email de recuperación de contraseña.

**No requiere autenticación.**

**Body:**
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Respuesta 200 (siempre, incluso si el email no existe):**
```json
{
  "message": "Si el email está registrado, recibirás un enlace de recuperación."
}
```

> ⚠️ Seguridad: la respuesta es **siempre la misma** — previene enumeración de usuarios (OWASP A07).

**Errores:**
| Código | Descripción |
|---|---|
| 422 | Formato de email inválido |
| 429 | Rate limit excedido |
| 500 | Error interno del servidor |

**Efecto (cuando el email existe):**
- Genera un token con `crypto.randomBytes(32)` — válido 1 hora
- Guarda el token en la tabla `password_reset_tokens`
- Envía email con enlace: `{FRONTEND_URL}/reset-password?token={token}`

---

### `POST /api/v1/auth/reset-password`

Restablece la contraseña usando el token de recuperación.

**No requiere autenticación.** (Requiere token de reset válido en el body.)

**Body:**
```json
{
  "token": "token-recibido-por-email",
  "newPassword": "MiNuevoPassword789"
}
```

**Validaciones:**
- `token`: requerido, string
- `newPassword`: mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número

**Respuesta 200:**
```json
{
  "success": true,
  "message": "Contraseña restablecida correctamente. Ya puedes iniciar sesión."
}
```

**Errores:**
| Código | Descripción |
|---|---|
| 400 | Token inválido, expirado o ya utilizado |
| 422 | Datos de entrada inválidos |
| 500 | Error interno del servidor |

---

## Usuarios — `/api/v1/users`

### `GET /api/v1/users/me`

Retorna el perfil completo del usuario actualmente autenticado.

**Requiere autenticación** — `Authorization: Bearer <access_token>`

**Respuesta 200:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "usuario@ejemplo.com",
  "fullName": "Juan Pérez",
  "isEmailVerified": true,
  "locale": "es",
  "createdAt": "2026-03-22T10:00:00.000Z",
  "updatedAt": "2026-03-22T10:00:00.000Z"
}
```

**Errores:**
| Código | Descripción |
|---|---|
| 401 | No autenticado o token inválido/expirado |
| 500 | Error interno del servidor |

---

### `PATCH /api/v1/users/me/locale`

Actualiza el idioma preferido del usuario autenticado. El valor se persiste en la base de datos.

**Requiere autenticación** — `Authorization: Bearer <access_token>`

**Body:**
```json
{
  "locale": "en"
}
```

**Validaciones:**
- `locale`: debe ser exactamente `"es"` o `"en"`

**Respuesta 200:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "usuario@ejemplo.com",
  "fullName": "Juan Pérez",
  "isEmailVerified": true,
  "locale": "en",
  "createdAt": "2026-03-22T10:00:00.000Z",
  "updatedAt": "2026-03-22T10:05:00.000Z"
}
```

**Errores:**
| Código | Descripción |
|---|---|
| 401 | No autenticado o token inválido/expirado |
| 422 | Locale inválido (no es "es" ni "en") |
| 500 | Error interno del servidor |

---

## Formato de Errores

Todos los errores siguen el formato estándar:

```json
{
  "error": "Descripción legible del error"
}
```

En errores de validación (422), se incluyen los detalles:
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Códigos de error internos

| Code | HTTP | Descripción |
|---|---|---|
| `VALIDATION_ERROR` | 422 | Datos de entrada inválidos (Zod) |
| `INVALID_CREDENTIALS` | 401 | Email o contraseña incorrectos |
| `UNAUTHORIZED` | 401 | Token faltante, inválido o expirado |
| `FORBIDDEN` | 403 | Sin permisos (ej: email no verificado) |
| `NOT_FOUND` | 404 | Recurso no encontrado |
| `CONFLICT` | 409 | Recurso ya existe (ej: email duplicado) |
| `TOO_MANY_REQUESTS` | 429 | Rate limit excedido |
| `INTERNAL_ERROR` | 500 | Error interno no anticipado |

---

## Rate Limiting

| Endpoint | Límite | Ventana |
|---|---|---|
| `POST /api/v1/auth/login` | 10 requests | 15 minutos |
| `POST /api/v1/auth/register` | 10 requests | 15 minutos |
| `POST /api/v1/auth/forgot-password` | 5 requests | 15 minutos |
| `POST /api/v1/auth/verify-email` | 10 requests | 15 minutos |
| `GET /api/v1/users/me` | Sin límite para usuarios auth | — |

---

## Ejemplos con curl

### Registro
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@ejemplo.com","fullName":"Test User","password":"Test1234"}'
```

### Verificar email
```bash
curl -X POST http://localhost:3000/api/v1/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token":"abc123token..."}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@ejemplo.com","password":"Test1234"}'
```

### Obtener perfil (con token)
```bash
curl http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer <access_token>"
```

### Cambiar contraseña
```bash
curl -X POST http://localhost:3000/api/v1/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"currentPassword":"Test1234","newPassword":"NuevoPass99"}'
```

### Actualizar idioma
```bash
curl -X PATCH http://localhost:3000/api/v1/users/me/locale \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"locale":"en"}'
```

---

## Health Check

### `GET /health`

Verifica que el servidor está activo.

**No requiere autenticación.**

**Respuesta 200:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-22T10:00:00.000Z"
}
```

---

## Autenticación — `/api/v1/auth`

### `POST /api/v1/auth/register`

Registra un nuevo usuario en el sistema.

**No requiere autenticación.**

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "full_name": "Juan Pérez",
  "password": "MiPassword123"
}
```

**Validaciones (zod):**
- `email`: formato email válido, requerido
- `full_name`: string, mínimo 2 caracteres, máximo 100, requerido
- `password`: mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número

**Respuesta 201:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "usuario@ejemplo.com",
  "full_name": "Juan Pérez",
  "is_active": true,
  "created_at": "2026-03-22T10:00:00.000Z"
}
```

**Errores:**
| Código | Descripción |
|---|---|
| 400 | Datos de entrada inválidos (zod validation error) |
| 409 | El email ya está registrado |
| 500 | Error interno del servidor |

---

### `POST /api/v1/auth/login`

Inicia sesión y retorna los tokens de acceso.

**No requiere autenticación.**

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "MiPassword123"
}
```

**Respuesta 200:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Errores:**
| Código | Descripción |
|---|---|
| 400 | Datos de entrada inválidos |
| 401 | Credenciales incorrectas (mensaje genérico) |
| 500 | Error interno del servidor |

> ⚠️ Seguridad: el mensaje de error NO revela si el email existe o no. Siempre devuelve "Invalid credentials".

---

### `POST /api/v1/auth/refresh`

Renueva el access token usando el refresh token.

**Requiere refresh token válido (no el access token).**

**Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta 200:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Errores:**
| Código | Descripción |
|---|---|
| 400 | Refresh token faltante |
| 401 | Refresh token inválido o expirado |
| 500 | Error interno del servidor |

---

### `POST /api/v1/auth/change-password`

Cambia la contraseña del usuario autenticado.

**Requiere autenticación** — `Authorization: Bearer <access_token>`

**Body:**
```json
{
  "current_password": "MiPasswordActual123",
  "new_password": "MiNuevoPassword456"
}
```

**Validaciones:**
- `current_password`: requerido
- `new_password`: mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número
- `new_password` no puede ser igual a `current_password`

**Respuesta 200:**
```json
{
  "message": "Password changed successfully"
}
```

**Errores:**
| Código | Descripción |
|---|---|
| 400 | Datos inválidos o nueva contraseña igual a la actual |
| 401 | No autenticado o contraseña actual incorrecta |
| 500 | Error interno del servidor |

---

### `POST /api/v1/auth/forgot-password`

Solicita el envío de un email de recuperación de contraseña.

**No requiere autenticación.**

**Body:**
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Respuesta 200:**
```json
{
  "message": "If that email exists, a reset link has been sent"
}
```

> ⚠️ Seguridad: la respuesta es **siempre la misma** independientemente de si el email existe o no. Esto previene enumeración de usuarios.

**Errores:**
| Código | Descripción |
|---|---|
| 400 | Formato de email inválido |
| 500 | Error interno del servidor |

**Efecto:**
- Genera un token UUID único con expiración de 1 hora
- Guarda el token en la tabla `password_reset_tokens`
- Envía email con enlace: `{FRONTEND_URL}/reset-password?token={token}`

---

### `POST /api/v1/auth/reset-password`

Restablece la contraseña usando el token de recuperación.

**No requiere autenticación.** (Requiere token de reset válido en el body.)

**Body:**
```json
{
  "token": "uuid-token-recibido-por-email",
  "new_password": "MiNuevoPassword789"
}
```

**Validaciones:**
- `token`: requerido, string
- `new_password`: mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número

**Respuesta 200:**
```json
{
  "message": "Password reset successfully"
}
```

**Errores:**
| Código | Descripción |
|---|---|
| 400 | Datos inválidos, token expirado, o token ya utilizado |
| 404 | Token no encontrado (mensaje genérico) |
| 500 | Error interno del servidor |

---

## Usuarios — `/api/v1/users`

### `GET /api/v1/users/me`

Retorna el perfil del usuario actualmente autenticado.

**Requiere autenticación** — `Authorization: Bearer <access_token>`

**Respuesta 200:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "usuario@ejemplo.com",
  "full_name": "Juan Pérez",
  "is_active": true,
  "created_at": "2026-03-22T10:00:00.000Z",
  "updated_at": "2026-03-22T10:00:00.000Z"
}
```

**Errores:**
| Código | Descripción |
|---|---|
| 401 | No autenticado o token inválido/expirado |
| 404 | Usuario no encontrado (edge case) |
| 500 | Error interno del servidor |

---

## Formato de Errores

Todos los errores siguen el formato estándar:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Descripción legible del error",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

El campo `details` solo aparece en errores de validación (400).

### Códigos de error internos

| Code | HTTP | Descripción |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Datos de entrada inválidos (zod) |
| `INVALID_CREDENTIALS` | 401 | Email o contraseña incorrectos |
| `UNAUTHORIZED` | 401 | Token faltante, inválido o expirado |
| `FORBIDDEN` | 403 | Sin permisos para este recurso |
| `NOT_FOUND` | 404 | Recurso no encontrado |
| `CONFLICT` | 409 | Recurso ya existe (ej: email duplicado) |
| `INTERNAL_ERROR` | 500 | Error interno no anticipado |

---

## Ejemplos con curl

### Registro
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@ejemplo.com","full_name":"Test User","password":"Test1234"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@ejemplo.com","password":"Test1234"}'
```

### Obtener perfil (con token)
```bash
curl http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer <access_token>"
```

### Cambiar contraseña
```bash
curl -X POST http://localhost:3000/api/v1/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"current_password":"Test1234","new_password":"NuevoPass99"}'
```
