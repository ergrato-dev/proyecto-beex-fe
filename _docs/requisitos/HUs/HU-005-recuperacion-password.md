# HU-005 — Recuperación de Contraseña por Email

**Como** usuario que olvidó su contraseña,
**quiero** recibir un email con un enlace para restablecerla,
**para** recuperar el acceso a mi cuenta sin intervención del administrador.

## Criterios de Aceptación

**CA-005.1** — El usuario puede solicitar recuperación ingresando su email en el formulario Forgot Password.

**CA-005.2** — El sistema responde con un mensaje genérico independientemente de si el email existe.

**CA-005.3** — Si el email existe, se genera un token de reset con expiración de 1 hora y se envía por email.

**CA-005.4** — El email contiene un enlace con el formato: `{FRONTEND_URL}/reset-password?token={token}`

**CA-005.5** — El usuario puede ingresar la nueva contraseña en la página de Reset Password usando el token del email.

**CA-005.6** — El sistema valida que el token no esté expirado ni haya sido usado antes.

**CA-005.7** — Tras el reset exitoso, el token queda marcado como usado y no puede reutilizarse.

**CA-005.8** — Tras el reset exitoso, el usuario es redirigido al login.

## Endpoints

`POST /api/v1/auth/forgot-password`
`POST /api/v1/auth/reset-password`
