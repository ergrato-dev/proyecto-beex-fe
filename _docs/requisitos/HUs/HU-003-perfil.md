<!--
  ¿Qué? Historia de usuario que describe la consulta del perfil del usuario autenticado.
  ¿Para qué? Formalizar la necesidad de mostrar los datos propios sin exponer datos de otros usuarios.
  ¿Impacto? Sin este endpoint, el frontend no puede mostrar el nombre ni el email del usuario logueado.
-->

# HU-003 — Ver Perfil de Usuario

## Identificación

| Campo            | Valor                          |
| ---------------- | ------------------------------ |
| **ID**           | HU-003                         |
| **Título**       | Ver perfil de usuario          |
| **Módulo**       | Usuario                        |
| **Prioridad**    | Alta                           |
| **Estado**       | Implementada                   |
| **RF asociados** | RF-004                         |

---

## Historia

**Como** usuario autenticado,
**quiero** ver mi información de perfil (nombre completo, email, fecha de registro),
**para** confirmar mis datos en el sistema.

---

## Criterios de Aceptación

### CA-003.1 — Datos del perfil en el dashboard
- **Dado que** estoy autenticado y en el dashboard (`/dashboard`),
- **cuando** la página carga,
- **entonces** debo ver mi nombre completo, email, estado de verificación de email y fecha de registro.

### CA-003.2 — Datos obtenidos del servidor
- **Dado que** estoy autenticado,
- **cuando** el dashboard carga,
- **entonces** los datos del perfil se obtienen con `GET /api/v1/users/me` — no solo del payload del token.

### CA-003.3 — Protección de la ruta
- **Dado que** el token es inválido o expirado,
- **cuando** intento acceder a `/dashboard`,
- **entonces** soy redirigido automáticamente al login (`/login`).

### CA-003.4 — No exposición de contraseña
- **Dado que** el perfil es retornado por la API,
- **cuando** reviso la respuesta,
- **entonces** el campo `hashed_password` no aparece en ningún momento.

### CA-003.5 — Estado de verificación de email
- **Dado que** estoy en mi perfil,
- **cuando** mi email aún no ha sido verificado,
- **entonces** debo ver un aviso indicando que debo verificar mi correo electrónico.

---

## Endpoints

| Método | Ruta               | Auth requerida | Descripción                        |
| ------ | ------------------ | -------------- | ---------------------------------- |
| GET    | `/api/v1/users/me` | Sí             | Retorna perfil del usuario actual  |

---

## Notas técnicas

- El `userId` del endpoint lo provee exclusivamente el middleware JWT — nunca el body ni parámetros de ruta (previene IDOR — OWASP A01).
- La respuesta incluye `is_email_verified` y `locale` para que el frontend pueda mostrar avisos y aplicar el idioma guardado.
