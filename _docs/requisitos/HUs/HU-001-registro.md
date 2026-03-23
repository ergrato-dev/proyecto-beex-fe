# HU-001 — Registro de Usuario

**Como** visitante no autenticado,
**quiero** crear una cuenta con mi email, nombre completo y contraseña,
**para** poder acceder al sistema con mis propias credenciales.

## Criterios de Aceptación

**CA-001.1** — El formulario de registro solicita: email, nombre completo, contraseña y confirmación de contraseña.

**CA-001.2** — El sistema valida que el email tenga formato válido.

**CA-001.3** — El sistema valida que la contraseña tenga mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula y 1 número.

**CA-001.4** — El sistema valida que la contraseña y la confirmación coincidan.

**CA-001.5** — Si el email ya está registrado, se muestra un mensaje de error apropiado.

**CA-001.6** — Si el registro es exitoso, el usuario es redirigido a la página de login.

**CA-001.7** — La contraseña se almacena como hash bcrypt (nunca en texto plano).

## Endpoint

`POST /api/v1/auth/register`
