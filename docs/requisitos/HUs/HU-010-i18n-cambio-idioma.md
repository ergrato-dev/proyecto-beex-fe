<!--
  ¿Qué? Historia de usuario que describe el cambio de idioma de la interfaz (ES/EN).
  ¿Para qué? Permitir que usuarios de distintos idiomas usen el sistema en su lengua preferida.
  ¿Impacto? El idioma preferido queda persistido en la BD para usuarios autenticados,
    garantizando coherencia entre sesiones y dispositivos.
-->

# HU-010 — Cambio de Idioma (i18n)

## Identificación

| Campo            | Valor                                   |
| ---------------- | --------------------------------------- |
| **ID**           | HU-010                                  |
| **Título**       | Cambio de idioma de la interfaz         |
| **Módulo**       | Internacionalización                    |
| **Prioridad**    | Media                                   |
| **Estado**       | Pendiente de implementación             |
| **RF asociados** | RF-009                                  |

---

## Historia

**Como** usuario del sistema (autenticado o no),
**quiero** cambiar el idioma de la interfaz entre Español e Inglés,
**para** usar el sistema en mi idioma preferido.

---

## Criterios de Aceptación

### CA-010.1 — Selector de idioma visible en toda la app
- **Dado que** estoy en cualquier página del sistema,
- **cuando** busco el selector de idioma,
- **entonces** lo encuentro en la barra de navegación (Navbar) claramente visible.

### CA-010.2 — Cambio inmediato del idioma
- **Dado que** selecciono un idioma diferente en el selector,
- **cuando** realizo la selección,
- **entonces** toda la interfaz cambia al idioma seleccionado inmediatamente, sin recargar la página.

### CA-010.3 — Persistencia en localStorage (usuarios no autenticados)
- **Dado que** no estoy autenticado y cambio el idioma,
- **cuando** cierro y abro el navegador (o navego entre páginas),
- **entonces** el idioma que elegí sigue activo — persiste en `localStorage`.

### CA-010.4 — Sincronización con el servidor (usuarios autenticados)
- **Dado que** estoy autenticado y cambio el idioma,
- **cuando** realizo la selección,
- **entonces** el frontend llama a `PATCH /api/v1/users/me/locale` para sincronizar el idioma preferido en la base de datos.

### CA-010.5 — Restauración del idioma al iniciar sesión
- **Dado que** inicio sesión,
- **cuando** el servidor responde con los datos del usuario (incluyendo el campo `locale`),
- **entonces** la interfaz adopta el idioma guardado en el perfil del usuario.

### CA-010.6 — Idioma predeterminado
- **Dado que** es la primera visita y no hay idioma guardado en localStorage,
- **cuando** la app carga,
- **entonces** el idioma predeterminado es Español (`es`).

### CA-010.7 — Idiomas soportados
- **Dado que** intento configurar un idioma no soportado (por ejemplo `fr`),
- **cuando** el servidor valida el campo `locale`,
- **entonces** retorna HTTP 422 indicando que solo se aceptan los valores `"es"` y `"en"`.

### CA-010.8 — Continuidad tras logout
- **Dado que** cierro sesión teniendo el idioma en inglés,
- **cuando** soy redirigido a la Landing Page,
- **entonces** el idioma activo sigue siendo inglés (el localStorage no se borra al hacer logout).

---

## Reglas de Negocio

| ID     | Regla                                                                                      |
| ------ | ------------------------------------------------------------------------------------------ |
| RN-060 | Los únicos idiomas soportados son `"es"` (Español) y `"en"` (English).                    |
| RN-061 | El idioma predeterminado es `"es"`.                                                        |
| RN-062 | Para usuarios no autenticados, el idioma se persiste solo en `localStorage`.              |
| RN-063 | Para usuarios autenticados, la base de datos es la fuente de verdad del idioma preferido. |
| RN-064 | Al hacer login, el `locale` del perfil del usuario sobreescribe el valor de `localStorage`. |
| RN-065 | El campo `locale` en la tabla `users` tiene valor `"es"` por defecto.                     |
| RN-066 | El endpoint `PATCH /me/locale` requiere autenticación con access token válido.            |

---

## Endpoint

| Método | Ruta                           | Auth requerida | Descripción                                  |
| ------ | ------------------------------ | -------------- | -------------------------------------------- |
| PATCH  | `/api/v1/users/me/locale`      | Sí             | Actualiza el idioma preferido del usuario    |

**Body:**
```json
{ "locale": "en" }
```

**Respuesta exitosa (200):**
```json
{
  "id": "...",
  "email": "usuario@ejemplo.com",
  "fullName": "Usuario Ejemplo",
  "locale": "en",
  "isEmailVerified": true,
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

---

## Notas técnicas

- El hook `useTheme` gestiona el modo visual (dark/light). El hook `useLocale` (o lógica en `i18n/index.ts`) gestiona el idioma.
- La librería de i18n utilizada en este proyecto es `i18next` con `react-i18next`.
- El idioma se aplica globalmente mediante el proveedor `I18nextProvider` en `main.tsx`.
- Al hacer logout, `localStorage` key `i18nextLng` NO se elimina — la preferencia de idioma es independiente de la sesión.
