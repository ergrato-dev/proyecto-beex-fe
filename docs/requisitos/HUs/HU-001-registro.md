<!--
  ¿Qué? Historia de usuario que describe el registro de un nuevo usuario en el sistema.
  ¿Para qué? Formalizar la necesidad del usuario de crear una cuenta para acceder al sistema.
  ¿Impacto? Es la puerta de entrada al sistema — sin registro, no hay usuarios.
-->

# HU-001 — Registro de Cuenta

## Identificación

| Campo            | Valor                      |
| ---------------- | -------------------------- |
| **ID**           | HU-001                     |
| **Título**       | Registro de cuenta         |
| **Módulo**       | Autenticación              |
| **Prioridad**    | Alta                       |
| **Estado**       | Implementada               |
| **RF asociados** | RF-001                     |

---

## Historia

**Como** usuario nuevo,
**quiero** crear una cuenta proporcionando mi nombre completo, correo electrónico y contraseña,
**para** poder acceder a las funcionalidades del sistema NN Auth.

---

## Criterios de Aceptación

### CA-001.1 — Formulario de registro completo
- **Dado que** estoy en la página de registro (`/register`),
- **cuando** veo el formulario,
- **entonces** debo encontrar campos para nombre completo, correo electrónico, contraseña y confirmación de contraseña, cada uno con su icono contextual.

### CA-001.2 — Validación de nombre
- **Dado que** estoy completando el formulario de registro,
- **cuando** ingreso un nombre con menos de 2 caracteres y envío el formulario,
- **entonces** debo ver un mensaje de error: "El nombre debe tener al menos 2 caracteres".

### CA-001.3 — Validación de correo obligatorio
- **Dado que** estoy completando el formulario de registro,
- **cuando** dejo el campo de correo vacío y envío el formulario,
- **entonces** debo ver un mensaje de error: "El correo es obligatorio".

### CA-001.4 — Validación de contraseña débil
- **Dado que** estoy completando el formulario de registro,
- **cuando** ingreso una contraseña que no cumple los requisitos mínimos,
- **entonces** debo ver un mensaje de error descriptivo indicando qué requisito falta (≥8 chars, mayúscula, minúscula, número).

### CA-001.5 — Confirmación de contraseña
- **Dado que** estoy completando el formulario de registro,
- **cuando** la contraseña y su confirmación no coinciden,
- **entonces** debo ver el mensaje: "Las contraseñas no coinciden".

### CA-001.6 — Registro exitoso con confirmación de email
- **Dado que** he completado todos los campos correctamente,
- **cuando** envío el formulario,
- **entonces** mi cuenta se crea y se me muestra un mensaje indicando que debo revisar mi correo electrónico para verificar la cuenta.

### CA-001.7 — Email duplicado
- **Dado que** intento registrarme con un correo que ya existe en el sistema,
- **cuando** envío el formulario,
- **entonces** debo ver un mensaje de error indicando que el email ya está registrado.

### CA-001.8 — Estado de carga
- **Dado que** envié el formulario de registro,
- **cuando** la solicitud está en proceso,
- **entonces** el botón "Crear cuenta" debe estar deshabilitado y mostrar un indicador de carga.

### CA-001.9 — Enlace a login
- **Dado que** estoy en la página de registro,
- **cuando** ya tengo una cuenta,
- **entonces** debo encontrar un enlace "Iniciar sesión" que me lleve a la página de login.

### CA-001.10 — Correo de verificación enviado tras el registro
- **Dado que** completé el registro exitosamente,
- **cuando** reviso mi bandeja de entrada,
- **entonces** debo recibir un correo con un enlace para verificar mi cuenta (válido por 24 horas).

### CA-001.11 — Bloqueo de login hasta verificar email
- **Dado que** me registré pero aún no hice clic en el enlace de verificación,
- **cuando** intento iniciar sesión con mis credenciales,
- **entonces** debo ver el mensaje: "Debes verificar tu email antes de iniciar sesión".

### CA-001.12 — Activación exitosa desde el enlace del correo
- **Dado que** hice clic en el enlace de verificación del correo,
- **cuando** el token es válido (no expirado, no usado),
- **entonces** mi cuenta queda activa y soy redirigido al login con un mensaje de éxito.

### CA-001.13 — Token de verificación expirado
- **Dado que** el enlace de verificación tiene más de 24 horas,
- **cuando** hago clic en él,
- **entonces** debo ver un mensaje indicando que el enlace expiró.

---

## Endpoints

| Método | Ruta                        | Descripción                               |
| ------ | --------------------------- | ----------------------------------------- |
| POST   | `/api/v1/auth/register`     | Crea la cuenta y envía email de verificación |
| POST   | `/api/v1/auth/verify-email` | Activa la cuenta con el token del email   |

---

## Notas técnicas

- La contraseña se almacena como hash bcrypt con factor de costo 12 — nunca en texto plano.
- El campo `is_email_verified` se establece en `false` al registrarse; el login retorna `403` hasta que sea `true`.
- El token de verificación de email usa UUID aleatorio, se almacena en la tabla `email_verification_tokens` y expira en 24 horas.
- Si el envío del correo falla (SMTP no disponible), el registro se completa de todas formas — el error no es bloqueante.
