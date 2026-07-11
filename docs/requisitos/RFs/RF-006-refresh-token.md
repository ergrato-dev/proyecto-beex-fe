<!--
  ¿Qué? Requisito funcional que describe la renovación del access token usando el refresh token.
  ¿Para qué? Definir la lógica del endpoint POST /api/v1/auth/refresh.
  ¿Impacto? Sin este RF, el usuario tendría que hacer login cada 15 minutos al expirar el access token.
-->

# RF-006 — Renovación de Token (Refresh)

**Historia de usuario relacionada**: HU-006

## Descripción

El sistema debe permitir obtener un nuevo par de tokens (access + refresh) usando un refresh token válido,
mediante el endpoint `POST /api/v1/auth/refresh`. Se implementa rotación de tokens para mayor seguridad.

---

## Flujo del proceso

| Paso | Descripción                                                                                     |
| ---- | ----------------------------------------------------------------------------------------------- |
| 1    | El cliente envía `POST /api/v1/auth/refresh` con `{ refreshToken }`.                            |
| 2    | El middleware `validate` verifica el body con `refreshTokenSchema`.                             |
| 3    | El servicio verifica la firma JWT del `refreshToken` con `JWT_REFRESH_SECRET`.                  |
| 4    | Si el token es inválido o expirado, retorna HTTP 401.                                           |
| 5    | Se verifica en el payload que `type === "refresh"` — evita usar un access token como refresh.  |
| 6    | Se busca al usuario por `userId` del payload — si no existe, retorna HTTP 401.                  |
| 7    | Se genera un nuevo `accessToken` (15 min) y un nuevo `refreshToken` (7 días).                   |
| 8    | Se retorna HTTP 200 con los nuevos tokens.                                                      |

---

## Reglas de Negocio

| ID      | Regla                                                                                         |
| ------- | --------------------------------------------------------------------------------------------- |
| RN-060  | El `refreshToken` se verifica con `JWT_REFRESH_SECRET` — diferente al secret del access token. |
| RN-061  | El payload del token debe tener `type === "refresh"` — los access tokens no son aceptados.    |
| RN-062  | Si el usuario no existe en la BD (cuenta eliminada), retorna HTTP 401.                         |
| RN-063  | Se implementa rotación de tokens: cada refresh genera un nuevo `refreshToken`.                 |
| RN-064  | El nuevo `accessToken` tiene duración de 15 minutos.                                           |
| RN-065  | El nuevo `refreshToken` tiene duración de 7 días.                                              |

---

## Inputs / Outputs

**Input** (body JSON):
```json
{ "refreshToken": "eyJ..." }
```

**Output éxito** (HTTP 200):
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "tokenType": "bearer"
}
```

**Output error 401** (token inválido o expirado):
```json
{ "error": "Invalid or expired refresh token" }
```

---

## Endpoint

| Método | Ruta                     | Auth requerida | Descripción                                    |
| ------ | ------------------------ | -------------- | ---------------------------------------------- |
| POST   | `/api/v1/auth/refresh`   | No†            | Genera nuevos tokens a partir del refresh token |

† Requiere el `refreshToken` en el body, no en el header de autorización.
