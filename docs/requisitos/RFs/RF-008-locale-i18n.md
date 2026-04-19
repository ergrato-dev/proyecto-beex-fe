<!--
  ¿Qué? Requisito funcional que describe la actualización del idioma preferido del usuario.
  ¿Para qué? Definir la lógica del endpoint PATCH /api/v1/users/me/locale.
  ¿Impacto? Sin sincronización con la BD, el idioma preferido se pierde al cambiar de dispositivo o sesión.
-->

# RF-008 — Actualización de Idioma (i18n / Locale)

**Historia de usuario relacionada**: HU-010

## Descripción

El sistema debe permitir actualizar el idioma preferido de un usuario autenticado
mediante el endpoint `PATCH /api/v1/users/me/locale`.

---

## Flujo del proceso

| Paso | Descripción                                                                              |
| ---- | ---------------------------------------------------------------------------------------- |
| 1    | El cliente envía `PATCH /api/v1/users/me/locale` con `{ locale }` y el header `Authorization: Bearer <accessToken>`. |
| 2    | El middleware `authenticate` verifica y decodifica el JWT.                               |
| 3    | El middleware `validate` verifica el body con `updateLocaleSchema`.                      |
| 4    | Si `locale` no es `"es"` ni `"en"`, retorna HTTP 422.                                    |
| 5    | El servicio actualiza el campo `locale` en la tabla `users` para el `userId` del token.  |
| 6    | Se retorna HTTP 200 con el perfil actualizado del usuario.                               |

---

## Reglas de Negocio

| ID      | Regla                                                                                         |
| ------- | --------------------------------------------------------------------------------------------- |
| RN-080  | Solo se aceptan los valores `"es"` y `"en"` para el campo `locale`.                          |
| RN-081  | El `userId` lo provee el middleware JWT — previene IDOR.                                      |
| RN-082  | La BD es la fuente de verdad del idioma para usuarios autenticados.                           |
| RN-083  | El valor por defecto en la BD es `"es"` (asignado al crear la cuenta en`.                     |

---

## Inputs / Outputs

**Input** (body JSON):
```json
{ "locale": "en" }
```

**Output éxito** (HTTP 200):
```json
{
  "id": "uuid",
  "email": "string",
  "fullName": "string",
  "isEmailVerified": true,
  "locale": "en",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Output error 422** (locale inválido):
```json
{ "error": "Validation failed", "details": [ { "field": "locale", "message": "Must be 'es' or 'en'" } ] }
```

---

## Endpoint

| Método | Ruta                        | Auth requerida | Descripción                                  |
| ------ | --------------------------- | -------------- | -------------------------------------------- |
| PATCH  | `/api/v1/users/me/locale`   | Sí             | Actualiza el idioma preferido del usuario    |
