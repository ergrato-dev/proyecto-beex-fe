---
description: "Genera tests completos para un archivo o módulo existente del proyecto (backend Vitest+Supertest o frontend Vitest+Testing Library)"
name: "Generar tests"
argument-hint: "Ruta del archivo a testear (ej: be/src/modules/auth/auth.service.ts)"
agent: "agent"
---

Genera tests completos para el archivo indicado, siguiendo los patrones de testing del proyecto.

## Detectar automáticamente el contexto

- Si el archivo está en `be/` → usar **Vitest + Supertest** con base de datos de pruebas
- Si el archivo está en `fe/src/pages/` → usar **Vitest + Testing Library + renderWithProviders**
- Si el archivo está en `fe/src/components/` → usar **Vitest + Testing Library**
- Si el archivo está en `fe/src/hooks/` → usar **Vitest + renderHook**

## Reglas de tests backend (`be/`)

- Cubrir: caso feliz, errores esperados (409, 401, 404), validaciones de entrada
- Usar `supertest` para tests HTTP end-to-end
- Limpiar la BD entre tests con `beforeEach`/`afterEach`
- Cobertura mínima: 80% en lógica de negocio

## Reglas de tests frontend (`fe/`)

- Usar `renderWithProviders` de `@/__tests__/helpers.tsx`
- Mockear funciones del contexto con `vi.fn()`
- Usar `userEvent` (no `fireEvent`) para simular interacciones
- `screen.getByRole` / `getByLabelText` preferido sobre `getByTestId`
- Cada test debe ser independiente (no compartir estado)

## Estructura mínima de tests a generar

1. ✅ Caso principal — flujo exitoso
2. ❌ Error del servidor / API falla — muestra mensaje de error
3. 🔄 Estado de carga — botón deshabilitado / spinner visible
4. 🛡️ Validación — campos requeridos, formatos incorrectos
5. 🧭 Navegación — redirige correctamente en éxito (si aplica)

## Referencia

Lee [be/src/tests/](../../be/src/tests/) y
[fe/src/**tests**/](../../fe/src/__tests__/) para entender los patrones existentes antes de generar.

Archivo a testear: $arg
