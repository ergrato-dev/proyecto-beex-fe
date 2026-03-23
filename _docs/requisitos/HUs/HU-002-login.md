# HU-002 — Inicio de Sesión

**Como** usuario registrado,
**quiero** iniciar sesión con mi email y contraseña,
**para** acceder a las funcionalidades protegidas del sistema.

## Criterios de Aceptación

**CA-002.1** — El formulario de login solicita email y contraseña.

**CA-002.2** — Si las credenciales son correctas, el sistema emite un access token (15 min) y un refresh token (7 días).

**CA-002.3** — Tras el login exitoso, el usuario es redirigido al Dashboard.

**CA-002.4** — Si las credenciales son incorrectas, se muestra un mensaje genérico que no revela si el email existe.

**CA-002.5** — Tras 10 intentos fallidos en 15 minutos desde la misma IP, el endpoint retorna 429 (Too Many Requests).

## Endpoint

`POST /api/v1/auth/login`
