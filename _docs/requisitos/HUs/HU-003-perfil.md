# HU-003 — Ver Perfil de Usuario

**Como** usuario autenticado,
**quiero** ver mi información de perfil (nombre, email, fecha de registro),
**para** confirmar mis datos en el sistema.

## Criterios de Aceptación

**CA-003.1** — El Dashboard muestra el nombre completo y email del usuario autenticado.

**CA-003.2** — Los datos se obtienen del servidor en tiempo real (no solo del token).

**CA-003.3** — Si el token es inválido o expirado, el usuario es redirigido al login.

**CA-003.4** — El perfil nunca muestra la contraseña ni su hash.

## Endpoint

`GET /api/v1/users/me`
