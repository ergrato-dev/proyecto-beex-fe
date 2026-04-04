---
description: "Crea una nueva página React en fe/src/pages/ con formulario, validación cliente, manejo de errores y tests"
name: "Nueva página frontend"
argument-hint: "Nombre de la página y ruta (ej: ProfilePage en /profile)"
agent: "agent"
---

Crea una nueva página en `fe/src/pages/` siguiendo los patrones establecidos en el proyecto.

## Estructura esperada de la página

```tsx
// Patrón estándar de cada página:
// 1. useAuth() para acciones/estado del contexto
// 2. useState local: formData, error, isLoading, success
// 3. validate() — validación cliente antes de llamar la API
// 4. handleSubmit — llama al service, muestra Alert, navega en éxito
// 5. Layout: AuthLayout (sin sesión) o AppLayout via rutas protegidas
```

## Reglas obligatorias

- Cabecera de archivo (¿Qué? ¿Para qué? ¿Impacto?)
- Comentarios pedagógicos en cada bloque significativo
- Usar componentes UI del proyecto: `Button`, `InputField`, `Alert` desde `@/components/ui/`
- TailwindCSS utility classes — sin CSS custom, sin degradados
- Botones de acción alineados a la **derecha** (`flex justify-end`)
- Dark mode: todas las clases con variante `dark:`
- `aria-*` en elementos interactivos (accesibilidad WCAG AA)
- Registrar la ruta en [fe/src/App.tsx](../../fe/src/App.tsx)

## También generar

- Test en `fe/src/__tests__/pages/$arg.test.tsx` con mínimo 5 casos:
  - Renderiza el formulario correctamente
  - Llama a la función de auth con los datos correctos
  - Muestra error cuando la operación falla
  - Muestra éxito cuando la operación pasa
  - Limpia el error al escribir en un campo

## Referencia de patrón existente

Lee [fe/src/pages/LoginPage.tsx](../../fe/src/pages/LoginPage.tsx) como modelo base.

Página a crear: $arg
