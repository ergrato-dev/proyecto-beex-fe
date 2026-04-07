<!--
  ¿Qué? Historia de usuario que describe la renovación automática del access token.
  ¿Para qué? Mantener la sesión activa sin requerir login cada 15 minutos.
  ¿Impacto? Sin este mecanismo, el usuario sería expulsado cada 15 min — experiencia muy mala.
-->

# HU-006 — Renovación de Token (Refresh)

## Identificación

| Campo            | Valor                          |
| ---------------- | ------------------------------ |
| **ID**           | HU-006                         |
| **Título**       | Renovación automática de sesión |
| **Módulo**       | Autenticación                  |
| **Prioridad**    | Alta                           |
| **Estado**       | Implementada                   |
| **RF asociados** | RF-003                         |

---

## Historia

**Como** usuario autenticado con sesión activa,
**quiero** que mi sesión se renueve automáticamente antes de que expire el access token,
**para** no tener que volver a iniciar sesión cada 15 minutos.

---

## Criterios de Aceptación

### CA-006.1 — Detección de token expirado
- **Dado que** el access token ha expirado,
- **cuando** el cliente realiza cualquier petición a la API,
- **entonces** el servidor retorna HTTP 401.

### CA-006.2 — Refresh automático
- **Dado que** el cliente recibe un 401 y tiene un refresh token vigente,
- **cuando** el interceptor de Axios detecta el 401,
- **entonces** llama automáticamente a `POST /api/v1/auth/refresh` y reintenta la petición original con el nuevo access token.

### CA-006.3 — Refresh token expirado
- **Dado que** el refresh token también ha expirado (>7 días),
- **cuando** el cliente intenta el refresh,
- **entonces** recibe HTTP 401, se limpian los tokens y se redirige al login.

### CA-006.4 — Transparencia para el usuario
- **Dado que** el proceso de refresh ocurre en segundo plano,
- **cuando** el token se renueva con éxito,
- **entonces** el usuario no percibe ninguna interrupción en su sesión.

### CA-006.5 — Rotación de tokens
- **Dado que** el refresh exitoso genera nuevos tokens,
- **cuando** el servidor responde al refresh,
- **entonces** se retornan un nuevo `access_token` Y un nuevo `refresh_token` (rotación), y el anterior queda obsoleto.

---

## Endpoint

| Método | Ruta                    | Auth requerida | Descripción                      |
| ------ | ----------------------- | -------------- | -------------------------------- |
| POST   | `/api/v1/auth/refresh`  | No†            | Genera nuevos tokens con el refresh token |

† Requiere el `refreshToken` en el body (no en el header de autorización).

---

## Notas técnicas

- La rotación de tokens implica que el servidor genera un nuevo `refreshToken` en cada llamada a `/refresh` — esto evita que un refresh token comprometido pueda usarse indefinidamente.
- El token `type` se verifica en el payload JWT — un access token no puede usarse como refresh token.
