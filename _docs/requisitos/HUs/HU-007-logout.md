# HU-007 — Cierre de Sesión

**Como** usuario autenticado,
**quiero** cerrar mi sesión,
**para** que mis tokens queden inactivos y mi cuenta esté protegida.

## Criterios de Aceptación

**CA-007.1** — El botón "Cerrar sesión" está visible en el Dashboard y en la navegación principal.

**CA-007.2** — Al cerrar sesión, los tokens se eliminan del estado del cliente (memoria/context).

**CA-007.3** — Tras cerrar sesión, el usuario es redirigido a la Landing Page o al Login.

**CA-007.4** — Una vez cerrada la sesión, no se puede acceder a rutas protegidas sin volver a autenticarse.

## Nota técnica

En esta implementación (stateless JWT), el logout se realiza en el cliente eliminando los tokens. No existe un endpoint de logout que invalide tokens en el servidor (para eso se necesitaría una blacklist de tokens, fuera del alcance de este proyecto educativo).
