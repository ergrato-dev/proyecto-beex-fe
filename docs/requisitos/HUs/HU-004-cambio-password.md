<!--
  ¿Qué? Historia de usuario que describe el cambio de contraseña de un usuario autenticado.
  ¿Para qué? Permitir al usuario actualizar su contraseña de forma segura conociendo la actual.
  ¿Impacto? Sin verificar la contraseña actual, cualquier acceso con el token podría apoderarse de la cuenta.
-->

# HU-004 — Cambio de Contraseña

## Identificación

| Campo            | Valor                          |
| ---------------- | ------------------------------ |
| **ID**           | HU-004                         |
| **Título**       | Cambio de contraseña           |
| **Módulo**       | Autenticación                  |
| **Prioridad**    | Alta                           |
| **Estado**       | Implementada                   |
| **RF asociados** | RF-005                         |

---

## Historia

**Como** usuario autenticado,
**quiero** cambiar mi contraseña actual por una nueva,
**para** mantener la seguridad de mi cuenta.

---

## Criterios de Aceptación

### CA-004.1 — Formulario de cambio
- **Dado que** estoy en la página de cambio de contraseña (`/change-password`),
- **cuando** veo el formulario,
- **entonces** debo encontrar campos para contraseña actual, nueva contraseña y confirmación de nueva contraseña.

### CA-004.2 — Verificación de contraseña actual
- **Dado que** ingreso una contraseña actual incorrecta,
- **cuando** envío el formulario,
- **entonces** debo ver un mensaje de error: "La contraseña actual es incorrecta".

### CA-004.3 — Fortaleza de nueva contraseña
- **Dado que** ingreso una nueva contraseña que no cumple los requisitos mínimos,
- **cuando** envío el formulario,
- **entonces** debo ver el mensaje indicando qué requisito falta.

### CA-004.4 — Contraseña nueva ≠ contraseña actual
- **Dado que** ingreso una nueva contraseña igual a la actual,
- **cuando** envío el formulario,
- **entonces** debo ver el mensaje: "La nueva contraseña no puede ser igual a la actual".

### CA-004.5 — Cambio exitoso
- **Dado que** ingresé correctamente la contraseña actual y la nueva,
- **cuando** envío el formulario,
- **entonces** debo ver un mensaje de confirmación de éxito.

### CA-004.6 — Requiere autenticación
- **Dado que** intento acceder a `/change-password` sin estar autenticado,
- **cuando** navego a esa ruta,
- **entonces** soy redirigido al login.

---

## Endpoint

| Método | Ruta                          | Auth requerida | Descripción                        |
| ------ | ----------------------------- | -------------- | ---------------------------------- |
| POST   | `/api/v1/auth/change-password`| Sí             | Cambia la contraseña del usuario   |

---

## Notas técnicas

- El servicio verifica `currentPassword` con bcrypt antes de aceptar el cambio.
- El evento de cambio de contraseña se registra en el log de auditoría con el `userId` (nunca el email).
