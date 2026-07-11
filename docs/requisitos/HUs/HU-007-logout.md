<!--
  ¿Qué? Historia de usuario que describe el cierre de sesión.
  ¿Para qué? Garantizar que el usuario puede terminar su sesión y proteger su cuenta.
  ¿Impacto? Sin logout, los tokens permanecen en memoria y cualquier acceso al dispositivo implicaría acceso a la cuenta.
-->

# HU-007 — Cierre de Sesión

## Identificación

| Campo            | Valor                      |
| ---------------- | -------------------------- |
| **ID**           | HU-007                     |
| **Título**       | Cierre de sesión           |
| **Módulo**       | Autenticación              |
| **Prioridad**    | Media                      |
| **Estado**       | Implementada               |
| **RF asociados** | —                          |

---

## Historia

**Como** usuario autenticado,
**quiero** cerrar mi sesión,
**para** que mis tokens queden inactivos y mi cuenta esté protegida.

---

## Criterios de Aceptación

### CA-007.1 — Botón de cierre de sesión visible
- **Dado que** estoy autenticado en cualquier página protegida,
- **cuando** busco una forma de cerrar sesión,
- **entonces** debo encontrar el botón "Cerrar sesión" visible en la barra de navegación.

### CA-007.2 — Limpieza de tokens en el cliente
- **Dado que** hago clic en "Cerrar sesión",
- **cuando** el logout se ejecuta,
- **entonces** los tokens (access y refresh) se eliminan del estado del cliente (AuthContext en memoria).

### CA-007.3 — Redirección tras logout
- **Dado que** cierro sesión exitosamente,
- **cuando** el proceso culmina,
- **entonces** soy redirigido a la Landing Page (`/`) o al Login (`/login`).

### CA-007.4 — Protección post-logout
- **Dado que** cerré sesión,
- **cuando** intento navegar a una ruta protegida (ej: `/dashboard`),
- **entonces** soy redirigido al login en lugar de ver la ruta protegida.

---

## Nota técnica

En esta implementación (stateless JWT), el logout se realiza **en el cliente** eliminando los tokens del `AuthContext`. No existe un endpoint de logout que invalide tokens en el servidor (para eso se necesitaría una blacklist de tokens en Redis, fuera del alcance de este proyecto educativo).

> **Concepto pedagógico:** La diferencia entre un sistema stateless (JWT) y stateful (sesiones de servidor) es precisamente ésta. En JWT, el servidor no sabe quién está "conectado" — la invalidación de sesión requiere mecanismos adicionales como blacklists.
