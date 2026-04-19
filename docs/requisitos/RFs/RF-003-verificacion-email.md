<!--
  ¿Qué? Requisito funcional que describe la verificación del email tras el registro.
  ¿Para qué? Definir la lógica del endpoint POST /api/v1/auth/verify-email.
  ¿Impacto? Sin este RF, la cuenta nunca puede activarse y el usuario no podría iniciar sesión.
-->

# RF-003 — Verificación de Email

**Historia de usuario relacionada**: HU-009

## Descripción

El sistema debe validar el token de verificación de email y activar la cuenta del usuario
mediante el endpoint `POST /api/v1/auth/verify-email`.

---

## Flujo del proceso

| Paso | Descripción                                                                                     |
| ---- | ----------------------------------------------------------------------------------------------- |
| 1    | El cliente envía `POST /api/v1/auth/verify-email` con `{ token }`.                              |
| 2    | El middleware `validate` verifica el body con el schema Zod `verifyEmailSchema`.                |
| 3    | El servicio busca el token en la tabla `email_verification_tokens`.                             |
| 4    | Si el token no existe, retorna HTTP 400: "Token de verificación inválido".                      |
| 5    | Si `expires_at < NOW()`, retorna HTTP 400: "El enlace de verificación ha expirado".             |
| 6    | Si `used = true`, retorna HTTP 400: "Este enlace ya fue utilizado".                             |
| 7    | Se actualiza `users.is_email_verified = true` para el usuario asociado al token.               |
| 8    | Se marca el token como `used = true` en `email_verification_tokens`.                            |
| 9    | Se registra el evento `EMAIL_VERIFIED` en el log de auditoría con el `userId`.                  |
| 10   | Se retorna HTTP 200 con mensaje de confirmación.                                                |

---

## Reglas de Negocio

| ID      | Regla                                                                                         |
| ------- | --------------------------------------------------------------------------------------------- |
| RN-040  | El token debe existir en la tabla `email_verification_tokens`.                               |
| RN-041  | El token no debe estar expirado (`expires_at >= NOW()`).                                      |
| RN-042  | El token no debe haber sido usado previamente (`used = false`).                               |
| RN-043  | Tras la verificación exitosa, `users.is_email_verified` se establece en `true`.               |
| RN-044  | Tras la verificación exitosa, el token se marca como `used = true` — es de un solo uso.       |
| RN-045  | El evento de verificación se registra en el log de auditoría (OWASP A09).                     |

---

## Inputs / Outputs

**Input** (body JSON):
```json
{ "token": "string" }
```

**Output éxito** (HTTP 200):
```json
{ "success": true, "message": "Email verificado correctamente. Ya puedes iniciar sesión." }
```

**Output error 400** (token inválido):
```json
{ "error": "Invalid or expired verification token" }
```

---

## Endpoint

| Método | Ruta                           | Auth requerida | Descripción                         |
| ------ | ------------------------------ | -------------- | ----------------------------------- |
| POST   | `/api/v1/auth/verify-email`    | No             | Valida el token y activa la cuenta  |
