<!--
  ¿Qué? Requisito funcional que describe el registro de nuevos usuarios.
  ¿Para qué? Definir la lógica exacta que implementar el endpoint POST /api/v1/auth/register.
  ¿Impacto? Este RF define qué datos se crean, qué reglas se aplican y qué ocurre con la verificación de email.
-->

# RF-001 — Registro de Usuarios

**Historia de usuario relacionada**: HU-001

## Descripción

El sistema debe permitir el registro de nuevos usuarios mediante el endpoint `POST /api/v1/auth/register`.
Tras el registro, el usuario recibe un email de verificación y no puede iniciar sesión hasta confirmar su dirección de correo.

---

## Flujo del proceso

| Paso | Descripción                                                                                    |
| ---- | ---------------------------------------------------------------------------------------------- |
| 1    | El cliente envía `POST /api/v1/auth/register` con `{ email, fullName, password }`.             |
| 2    | El middleware `validate` verifica el body con el schema Zod `registerSchema`.                  |
| 3    | Si la validación falla, se retorna HTTP 422 con los errores detallados.                        |
| 4    | El servicio `auth.service.ts` consulta la BD para verificar si el email ya existe.             |
| 5    | Si el email existe, se retorna HTTP 409 con mensaje genérico (anti-enumeración).              |
| 6    | Se genera el hash bcrypt de la contraseña (salt rounds = 12).                                 |
| 7    | Se inserta el nuevo usuario en la tabla `users` con `is_email_verified = false`.              |
| 8    | Se genera un token de verificación con `crypto.randomBytes(32)`.                               |
| 9    | Se guarda el token en la tabla `email_verification_tokens` con expiración de 24 horas.       |
| 10   | Se envía el email de verificación con el enlace: `{FRONTEND_URL}/verify-email?token={token}`. |
| 11   | Se retorna HTTP 201 con los datos del usuario creado (sin `hashed_password`).                  |

---

## Reglas de Negocio

| ID      | Regla                                                                                     |
| ------- | ----------------------------------------------------------------------------------------- |
| RN-001  | El campo `email` debe tener formato válido (RFC 5322).                                    |
| RN-002  | El campo `email` debe ser único en el sistema; si ya existe, retornar HTTP 409.           |
| RN-003  | El campo `fullName` debe tener entre 2 y 100 caracteres.                                  |
| RN-004  | El campo `password` debe tener mínimo 8 caracteres.                                      |
| RN-005  | El campo `password` debe contener al menos 1 letra mayúscula.                            |
| RN-006  | El campo `password` debe contener al menos 1 letra minúscula.                            |
| RN-007  | El campo `password` debe contener al menos 1 dígito numérico.                            |
| RN-008  | La contraseña debe almacenarse como hash bcrypt con factor de costo 12.                   |
| RN-009  | La respuesta de éxito (HTTP 201) no debe incluir el campo `hashed_password`.             |
| RN-010  | El nuevo usuario se crea con `is_email_verified = false` hasta completar la verificación. |
| RN-011  | El token de verificación de email expira en 24 horas desde su creación.                  |
| RN-012  | El token de verificación es de un solo uso — se marca `used = true` al activar la cuenta. |
| RN-013  | El nuevo usuario se crea con `locale = 'es'` por defecto.                                  |

---

## Inputs / Outputs

**Input** (body JSON):
```json
{ "email": "string", "fullName": "string", "password": "string" }
```

**Output éxito** (HTTP 201):
```json
{
  "id": "uuid",
  "email": "string",
  "fullName": "string",
  "isEmailVerified": false,
  "locale": "es",
  "createdAt": "timestamp"
}
```

**Output error 422** (validación fallida):
```json
{ "error": "Validation failed", "details": [ { "field": "password", "message": "..." } ] }
```

**Output error 409** (email ya registrado):
```json
{ "error": "Email already registered" }
```

---

## Endpoint

| Método | Ruta                         | Auth requerida | Descripción                  |
| ------ | ---------------------------- | -------------- | ---------------------------- |
| POST   | `/api/v1/auth/register`      | No             | Registra un nuevo usuario    |
| POST   | `/api/v1/auth/verify-email`  | No             | Activa la cuenta del usuario |
