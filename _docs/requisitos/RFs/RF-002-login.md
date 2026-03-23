# RF-002 — Login de Usuarios

**Historia de usuario relacionada**: HU-002

## Descripción

El sistema debe autenticar usuarios y emitir tokens JWT mediante `POST /api/v1/auth/login`.

## Reglas de Negocio

**RN-010** — El sistema busca al usuario por email; si no existe, retorna HTTP 401 con mensaje genérico.
**RN-011** — El sistema verifica la contraseña con bcrypt; si no coincide, retorna HTTP 401 con mensaje genérico.
**RN-012** — El mensaje de error de login es siempre "Invalid credentials" — no revela si el email existe.
**RN-013** — Tras autenticación exitosa, se emite un access token con expiración de 15 minutos.
**RN-014** — Tras autenticación exitosa, se emite un refresh token con expiración de 7 días.
**RN-015** — Ambos tokens se firman con HS256 usando los secrets de las variables de entorno.
**RN-016** — El endpoint tiene rate limiting: máximo 10 requests por IP en una ventana de 15 minutos.
