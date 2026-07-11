<!--
  ¿Qué? Historia de usuario que describe la Landing Page pública del sistema.
  ¿Para qué? Presentar el sistema a visitantes no autenticados y ofrecer acceso a registro/login.
  ¿Impacto? Es la primera impresión del sistema — define la imagen del proyecto.
-->

# HU-008 — Landing Page Pública

## Identificación

| Campo            | Valor                      |
| ---------------- | -------------------------- |
| **ID**           | HU-008                     |
| **Título**       | Landing page pública       |
| **Módulo**       | Interfaz pública           |
| **Prioridad**    | Media                      |
| **Estado**       | Implementada               |
| **RF asociados** | —                          |

---

## Historia

**Como** visitante (no autenticado),
**quiero** ver una página de inicio atractiva que presente el sistema,
**para** entender qué es la aplicación y decidir si registrarme.

---

## Criterios de Aceptación

### CA-008.1 — Ruta pública
- **Dado que** accedo a la URL raíz del sistema (`/`),
- **cuando** no estoy autenticado,
- **entonces** debo ver la Landing Page (no redirigir al login).

### CA-008.2 — Contenido de la landing
- **Dado que** estoy en la Landing Page,
- **cuando** la página carga,
- **entonces** debo ver: nombre y propósito del sistema, lista de funcionalidades, botones de CTA ("Registrarse" e "Iniciar sesión").

### CA-008.3 — Footer con páginas legales
- **Dado que** estoy en la Landing Page,
- **cuando** busco información legal,
- **entonces** el footer debe contener enlaces a: Términos de Uso, Política de Privacidad, Política de Cookies, y Contacto.

### CA-008.4 — Diseño responsive y dark/light mode
- **Dado que** accedo desde diferentes dispositivos y modos de visualización,
- **cuando** uso la Landing Page,
- **entonces** el diseño es responsive (mobile-first) y soporta dark mode y light mode.

### CA-008.5 — Selector de idioma visible
- **Dado que** estoy en la Landing Page,
- **cuando** busco cambiar el idioma de la interfaz,
- **entonces** encuentro el selector de idioma en la barra de navegación (Español / English).

---

## Notas técnicas

- Esta página es completamente pública — no requiere autenticación ni JWT.
- El selector de idioma (i18n) debe ser funcional en páginas públicas sin necesidad de estar autenticado.
