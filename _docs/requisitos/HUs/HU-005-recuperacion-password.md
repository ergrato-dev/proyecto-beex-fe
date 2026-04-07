<!--
  ¿Qué? Historia de usuario que describe la recuperación de contraseña por email.
  ¿Para qué? Permitir al usuario recuperar el acceso sin intervención de un administrador.
  ¿Impacto? Sin este flujo, una contraseña olvidada implica pérdida permanente de acceso.
-->

# HU-005 — Recuperación de Contraseña por Email

## Identificación

| Campo            | Valor                                   |
| ---------------- | --------------------------------------- |
| **ID**           | HU-005                                  |
| **Título**       | Recuperación de contraseña por email    |
| **Módulo**       | Autenticación                           |
| **Prioridad**    | Alta                                    |
| **Estado**       | Implementada                            |
| **RF asociados** | RF-006                                  |

---

## Historia

**Como** usuario que olvidó su contraseña,
**quiero** recibir un email con un enlace para restablecerla,
**para** recuperar el acceso a mi cuenta sin intervención del administrador.

---

## Criterios de Aceptación

### CA-005.1 — Formulario de solicitud
- **Dado que** estoy en `/forgot-password`,
- **cuando** ingreso mi correo electrónico y envío el formulario,
- **entonces** el sistema responde con el mensaje: "Si el email está registrado, recibirás un enlace de recuperación".

### CA-005.2 — Respuesta genérica (anti-enumeración)
- **Dado que** ingreso un email NO registrado,
- **cuando** envío el formulario,
- **entonces** el mensaje es idéntico al de un email registrado — no revela si el email existe.

### CA-005.3 — Email con enlace de recuperación
- **Dado que** el email ingresado sí está registrado,
- **cuando** el sistema procesa la solicitud,
- **entonces** se genera un token único con expiración de 1 hora y se envía un email con el enlace: `{FRONTEND_URL}/reset-password?token={token}`.

### CA-005.4 — Formulario de restablecimiento
- **Dado que** hago clic en el enlace del email,
- **cuando** llego a `/reset-password`,
- **entonces** veo un formulario con campos para nueva contraseña y confirmación.

### CA-005.5 — Token válido
- **Dado que** el token es válido (existe, no expirado, no usado),
- **cuando** envío la nueva contraseña,
- **entonces** la contraseña se actualiza y el token queda marcado como usado.

### CA-005.6 — Token inválido o expirado
- **Dado que** el token es inválido, ha expirado o ya fue usado,
- **cuando** envío la nueva contraseña,
- **entonces** debo ver un mensaje de error indicando que el enlace no es válido.

### CA-005.7 — Redirección tras reset exitoso
- **Dado que** el reset fue exitoso,
- **cuando** el proceso culmina,
- **entonces** soy redirigido al login con un mensaje de confirmación.

### CA-005.8 — Rate limiting en forgot-password
- **Dado que** se hacen más de 5 solicitudes desde la misma IP en un minuto,
- **cuando** se intenta una solicitud adicional,
- **entonces** se retorna HTTP 429.

---

## Endpoints

| Método | Ruta                           | Auth requerida | Descripción                              |
| ------ | ------------------------------ | -------------- | ---------------------------------------- |
| POST   | `/api/v1/auth/forgot-password` | No             | Genera token y envía email de recuperación |
| POST   | `/api/v1/auth/reset-password`  | No             | Valida token y actualiza la contraseña   |

---

## Notas técnicas

- La solicitud de recuperación se registra en el log de auditoría (sin guardar el email para no revelar qué cuentas existen).
- El token de reset se genera con `crypto.randomBytes(32)` en Express — 256 bits de entropía.
