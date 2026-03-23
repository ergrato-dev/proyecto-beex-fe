# API Endpoints — NN Auth System (Express Edition)

## Información General

| Campo | Valor |
|---|---|
| Base URL (desarrollo) | `http://localhost:3000` |
| Prefijo de versión | `/api/v1` |
| Formato de datos | `application/json` |
| Autenticación | `Authorization: Bearer <access_token>` |
| Rate limiting | 10 req / 15 min en `/api/v1/auth/` |

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
