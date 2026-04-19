<!--
  ¿Qué? Historia de usuario que describe el inicio de sesión en el sistema.
  ¿Para qué? Formalizar la necesidad del usuario de autenticarse para acceder a funcionalidades protegidas.
  ¿Impacto? Sin login, el sistema no puede identificar ni autorizar a los usuarios.
-->

# HU-002 — Inicio de Sesión

## Identificación

| Campo            | Valor                      |
| ---------------- | -------------------------- |
| **ID**           | HU-002                     |
| **Título**       | Inicio de sesión           |
| **Módulo**       | Autenticación              |
| **Prioridad**    | Alta                       |
| **Estado**       | Implementada               |
| **RF asociados** | RF-002                     |

---

## Historia

**Como** usuario registrado,
**quiero** iniciar sesión con mi correo electrónico y contraseña,
**para** acceder a mi perfil y las funcionalidades protegidas del sistema.

---

## Criterios de Aceptación

### CA-002.1 — Formulario de login
- **Dado que** estoy en la página de login (`/login`),
- **cuando** veo el formulario,
- **entonces** debo encontrar campos para correo electrónico y contraseña, con sus iconos correspondientes.

### CA-002.2 — Login exitoso con redirección
- **Dado que** he ingresado credenciales válidas (correo y contraseña correctos) y mi email está verificado,
- **cuando** envío el formulario,
- **entonces** inicio sesión exitosamente y soy redirigido al dashboard (`/dashboard`).

### CA-002.3 — Credenciales inválidas
- **Dado que** he ingresado credenciales incorrectas,
- **cuando** envío el formulario,
- **entonces** debo ver un mensaje de error genérico sin indicar si el error es del correo o la contraseña.

### CA-002.4 — Toggle de visibilidad de contraseña
- **Dado que** estoy escribiendo mi contraseña,
- **cuando** hago clic en el botón de ojo junto al campo,
- **entonces** la contraseña se muestra en texto plano, y al hacer clic de nuevo se oculta.

### CA-002.5 — Estado de carga
- **Dado que** envié el formulario de login,
- **cuando** la solicitud está en proceso,
- **entonces** el botón "Iniciar sesión" debe estar deshabilitado y mostrar indicador de carga.

### CA-002.6 — Enlace a registro
- **Dado que** estoy en la página de login y no tengo cuenta,
- **cuando** busco una forma de registrarme,
- **entonces** debo encontrar un enlace "Crear cuenta" que me lleve a la página de registro.

### CA-002.7 — Enlace a recuperación de contraseña
- **Dado que** estoy en la página de login y olvidé mi contraseña,
- **cuando** busco una forma de recuperarla,
- **entonces** debo encontrar un enlace "¿Olvidaste tu contraseña?" que me lleve a la página de forgot-password.

### CA-002.8 — Renovación automática de sesión
- **Dado que** mi access token ha expirado pero mi refresh token sigue vigente,
- **cuando** el sistema detecta la expiración,
- **entonces** debe renovar automáticamente el access token sin que yo tenga que volver a iniciar sesión.

### CA-002.9 — Bloqueo por email no verificado
- **Dado que** me registré pero aún no verifiqué mi email,
- **cuando** intento iniciar sesión,
- **entonces** debo ver el mensaje: "Debes verificar tu email antes de iniciar sesión" (HTTP 403).

### CA-002.10 — Rate limiting
- **Dado que** se realizan 10 intentos fallidos de login desde la misma IP en 15 minutos,
- **cuando** se intenta un nuevo login,
- **entonces** el servidor retorna HTTP 429 (Too Many Requests).

---

## Endpoint

`POST /api/v1/auth/login`

---

## Notas técnicas

- El mensaje de error es idéntico tanto si el email no existe como si la contraseña es incorrecta (previene user enumeration — OWASP A07).
- El campo `is_email_verified` es verificado como condición previa al login — un `false` retorna `403 Forbidden`.
- El campo `is_active` es verificado como condición previa al login — una cuenta desactivada retorna `403`.
- Los eventos de login exitoso y fallido se registran en el log de auditoría de seguridad.
