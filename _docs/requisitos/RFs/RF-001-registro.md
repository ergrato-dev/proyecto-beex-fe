# RF-001 — Registro de Usuarios

**Historia de usuario relacionada**: HU-001

## Descripción

El sistema debe permitir el registro de nuevos usuarios mediante el endpoint `POST /api/v1/auth/register`.

## Reglas de Negocio

**RN-001** — El campo `email` debe tener formato válido (RFC 5322).
**RN-002** — El campo `email` debe ser único en el sistema; si ya existe, retornar HTTP 409.
**RN-003** — El campo `full_name` debe tener entre 2 y 100 caracteres.
**RN-004** — El campo `password` debe tener mínimo 8 caracteres.
**RN-005** — El campo `password` debe contener al menos 1 letra mayúscula.
**RN-006** — El campo `password` debe contener al menos 1 letra minúscula.
**RN-007** — El campo `password` debe contener al menos 1 dígito numérico.
**RN-008** — La contraseña debe almacenarse como hash bcrypt con factor de costo 12.
**RN-009** — La respuesta de éxito (HTTP 201) no debe incluir el campo `hashed_password`.

## Inputs / Outputs

**Input** (body JSON):
```json
{ "email": "string", "full_name": "string", "password": "string" }
```

**Output éxito** (HTTP 201):
```json
{ "id": "uuid", "email": "string", "full_name": "string", "is_active": true, "created_at": "timestamp" }
```
