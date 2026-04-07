<!--
  ¿Qué? Historia de usuario que describe el flujo de verificación de email post-registro.
  ¿Para qué? Confirmar que el email proporcionado es real antes de permitir el login.
  ¿Impacto? Sin verificación de email, cualquier persona podría registrar cuentas falsas o con
    emails ajenos, comprometiendo la integridad del sistema y la privacidad de terceros.
-->

# HU-009 — Verificación de Email

## Identificación

| Campo            | Valor                                   |
| ---------------- | --------------------------------------- |
| **ID**           | HU-009                                  |
| **Título**       | Verificación de email tras el registro  |
| **Módulo**       | Autenticación                           |
| **Prioridad**    | Alta                                    |
| **Estado**       | Pendiente de implementación             |
| **RF asociados** | RF-008                                  |

---

## Historia

**Como** usuario recién registrado,
**quiero** recibir un email con un enlace de verificación y activar mi cuenta,
**para** poder iniciar sesión y usar el sistema.

---

## Criterios de Aceptación

### CA-009.1 — Email de verificación enviado tras el registro
- **Dado que** completo el formulario de registro con datos válidos,
- **cuando** el servidor crea mi cuenta,
- **entonces** recibo en mi correo un email con el asunto "Verifica tu cuenta en NN Auth System" y un enlace de verificación único.

### CA-009.2 — Página intermedia de espera
- **Dado que** acabo de registrarme,
- **cuando** soy redirigido tras el registro,
- **entonces** veo una página o mensaje que me indica: "Revisa tu correo electrónico y haz clic en el enlace de verificación para activar tu cuenta".

### CA-009.3 — Token válido activa la cuenta
- **Dado que** hago clic en el enlace de verificación del email,
- **cuando** el sistema valida el token (existe, no ha expirado, no ha sido usado),
- **entonces** mi cuenta queda activa (`is_email_verified = true`), el token se marca como usado, y soy redirigido al login con el mensaje: "¡Email verificado correctamente! Ya puedes iniciar sesión".

### CA-009.4 — Token expirado
- **Dado que** hago clic en el enlace después de que hayan pasado 24 horas,
- **cuando** el servidor valida el token expirado,
- **entonces** veo el mensaje: "El enlace de verificación ha expirado. Por favor regístrate de nuevo o solicita un nuevo enlace".

### CA-009.5 — Token ya utilizado
- **Dado que** hago clic en el enlace de verificación por segunda vez,
- **cuando** el servidor detecta que el token ya fue marcado como usado,
- **entonces** veo el mensaje: "Este enlace ya fue utilizado. Tu cuenta ya está verificada, inicia sesión".

### CA-009.6 — Token inexistente
- **Dado que** alguien accede a `/verify-email?token=invalido`,
- **cuando** el servidor no encuentra el token en la base de datos,
- **entonces** recibe HTTP 400 con el mensaje: "Token de verificación inválido".

### CA-009.7 — Login bloqueado hasta verificación
- **Dado que** mi cuenta existe pero `is_email_verified = false`,
- **cuando** intento iniciar sesión con credenciales correctas,
- **entonces** recibo HTTP 403 con el mensaje: "Debes verificar tu email antes de iniciar sesión".

---

## Reglas de Negocio

| ID     | Regla                                                                                                   |
| ------ | ------------------------------------------------------------------------------------------------------- |
| RN-050 | El token de verificación se genera con `crypto.randomBytes(32)` — 256 bits de entropía.                |
| RN-051 | El token expira a las 24 horas desde su creación.                                                       |
| RN-052 | Al verificar el email, el token se marca como `used = true` — es de un solo uso.                       |
| RN-053 | El servidor siempre retorna HTTP 200 al registrarse, independientemente de si el email ya existe (anti-enumeración). El bloqueo de emails duplicados ocurre con HTTP 409, pero el mensaje es genérico. |
| RN-054 | El campo `is_email_verified` en la tabla `users` tiene valor `false` por defecto.                       |
| RN-055 | La verificación exitosa se registra en el log de auditoría con el `userId`.                             |

---

## Endpoint

| Método | Ruta                           | Auth requerida | Descripción                         |
| ------ | ------------------------------ | -------------- | ----------------------------------- |
| POST   | `/api/v1/auth/verify-email`    | No             | Valida el token y activa la cuenta  |

**Body:**
```json
{ "token": "a3f9b2c..." }
```

**Respuesta exitosa (200):**
```json
{ "success": true, "message": "Email verificado correctamente. Ya puedes iniciar sesión." }
```

---

## Notas técnicas

- La tabla `email_verification_tokens` almacena los tokens con relación `user_id → users(id)`.
- El enlace del email tiene el formato: `{FRONTEND_URL}/verify-email?token={token}`.
- El frontend extrae el `token` del query param y lo envía al endpoint `POST /verify-email`.
- La verificación del email se registra en el log de auditoría: evento `EMAIL_VERIFIED` con `userId`.
