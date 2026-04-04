---
description: "Crea un componente UI reutilizable en fe/src/components/ui/ con props tipadas, dark mode y tests"
name: "Nuevo componente UI"
argument-hint: "Nombre y propósito del componente (ej: Badge para mostrar estados)"
agent: "agent"
---

Crea un componente UI atómico en `fe/src/components/ui/` siguiendo el design system del proyecto.

## Reglas del design system

- **Sin degradados** — colores planos y sólidos únicamente
- **Fuentes sans-serif** — clases Tailwind sin `font-serif`
- **Dark mode** — cada clase de color debe tener su variante `dark:`
- **Transiciones suaves** — `transition-colors duration-200` en hover/focus
- **Bordes sutiles** — `border border-gray-200 dark:border-gray-700`
- **Mobile-first** — el componente debe verse bien en pantallas pequeñas

## Estructura del componente

```tsx
// 1. Interface de props con JSDoc comentando cada prop
// 2. Variantes definidas como objeto de clases (no condicionales inline)
// 3. Exportación nombrada (no default)
// 4. aria-* necesarios para accesibilidad (WCAG AA)
```

## Reglas obligatorias

- Cabecera de archivo (¿Qué? ¿Para qué? ¿Impacto?)
- Tipos TypeScript explícitos — sin `any`
- Comentarios pedagógicos en bloques significativos
- Props opcionales con valores default razonables

## También generar

- Test en `fe/src/__tests__/components/$arg.test.tsx` con mínimo 4 casos:
  - Renderiza con props básicas
  - Aplica variantes/estilos correctamente
  - Props opcionales tienen defaults correctos
  - Accesibilidad: aria atributos presentes

## Referencia de patrón existente

Lee [fe/src/components/ui/Button.tsx](../../fe/src/components/ui/Button.tsx) y
[fe/src/components/ui/Alert.tsx](../../fe/src/components/ui/Alert.tsx) como modelo base.

Componente a crear: $arg
