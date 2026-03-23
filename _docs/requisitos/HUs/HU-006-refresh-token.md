# HU-006 — Renovación de Token (Refresh)

**Como** usuario autenticado con sesión activa,
**quiero** que mi sesión se renueve automáticamente antes de que expire el access token,
**para** no tener que volver a iniciar sesión cada 15 minutos.

## Criterios de Aceptación

**CA-006.1** — El cliente detecta cuando el access token está próximo a expirar o ha expirado (error 401).

**CA-006.2** — El cliente usa el refresh token para obtener un nuevo access token automáticamente.

**CA-006.3** — Si el refresh token también ha expirado, el usuario es redirigido al login.

**CA-006.4** — El proceso de refresh es transparente para el usuario (no ve ninguna interrupción).

## Endpoint

`POST /api/v1/auth/refresh`
