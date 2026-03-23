# HU-004 — Cambio de Contraseña

**Como** usuario autenticado,
**quiero** cambiar mi contraseña actual por una nueva,
**para** mantener la seguridad de mi cuenta.

## Criterios de Aceptación

**CA-004.1** — El formulario solicita: contraseña actual, nueva contraseña y confirmación de nueva contraseña.

**CA-004.2** — El sistema verifica que la contraseña actual sea correcta antes de permitir el cambio.

**CA-004.3** — La nueva contraseña debe cumplir los requisitos de fortaleza (mínimo 8 chars, mayúscula, minúscula, número).

**CA-004.4** — La nueva contraseña no puede ser igual a la contraseña actual.

**CA-004.5** — Tras el cambio exitoso, se muestra un mensaje de confirmación.

**CA-004.6** — Requiere estar autenticado (access token válido).

## Endpoint

`POST /api/v1/auth/change-password`
