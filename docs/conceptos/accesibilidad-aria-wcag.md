# Accesibilidad — ARIA y WCAG 2.1 AA

## ¿Por qué importa la accesibilidad?

La accesibilidad web garantiza que personas con discapacidades visuales, motoras, cognitivas o auditivas puedan usar la aplicación. En Colombia, la Ley 1346 de 2009 ratifica la Convención de la ONU sobre Derechos de Personas con Discapacidad. Técnicamente, se siguen las pautas **WCAG 2.1 nivel AA**.

---

## Los 4 Principios WCAG (POUR)

| Principio | Descripción |
|---|---|
| **P**erceptible | El contenido debe ser presentable de formas que el usuario pueda percibir |
| **O**perable | Los componentes deben ser operables por teclado y sin interacciones complejas |
| **U**nderstandable | El contenido debe ser comprensible |
| **R**obust | El contenido debe interpretarse correctamente por tecnologías asistivas |

---

## Implementación en Este Proyecto

### 1. Formularios Accesibles

Todo input debe tener un `<label>` asociado explícitamente:

```tsx
// ✅ CORRECTO — label asociado con htmlFor
<div>
  <label htmlFor="email" className="block text-sm font-medium">
    Correo electrónico
  </label>
  <input
    id="email"
    name="email"
    type="email"
    aria-required="true"
    aria-describedby="email-error"
    autoComplete="email"
  />
  {error && (
    <p id="email-error" role="alert" className="text-sm text-red-600">
      {error}
    </p>
  )}
</div>

// ❌ INCORRECTO — sin label
<input type="email" placeholder="Correo" />
```

### 2. Mensajes de Error

Los errores deben ser anunciados a lectores de pantalla:

```tsx
// ✅ role="alert" anuncia el error automáticamente
<p role="alert" aria-live="assertive" className="text-red-600">
  {errorMessage}
</p>

// ✅ Para mensajes informativos menos urgentes
<p role="status" aria-live="polite">
  {successMessage}
</p>
```

### 3. Botones y Elementos Interactivos

```tsx
// ✅ Botón con estado de carga accesible
<button
  type="submit"
  disabled={isLoading}
  aria-disabled={isLoading}
  aria-busy={isLoading}
>
  {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
</button>

// ✅ Botón solo con icono — necesita aria-label
<button aria-label="Cerrar modal">
  <XIcon />
</button>
```

### 4. Contraste de Color (WCAG AA)

Requisito mínimo: relación de contraste **4.5:1** para texto normal, **3:1** para texto grande.

| Combinación | Contraste | ¿Cumple AA? |
|---|---|---|
| `text-gray-900` sobre `white` | 21:1 | ✅ |
| `text-gray-700` sobre `white` | 7.4:1 | ✅ |
| `text-white` sobre `bg-blue-600` | 4.9:1 | ✅ |
| `text-gray-400` sobre `white` | 2.9:1 | ❌ (solo decorativo) |

### 5. Navegación por Teclado

Todos los elementos interactivos deben ser alcanzables con `Tab` y activables con `Enter`/`Space`:

```tsx
// ✅ Focus visible — nunca eliminar outline sin reemplazar
// En index.css o tailwind.config.ts
// .focus-visible:ring-2 .focus-visible:ring-blue-500

<input
  className="... focus:outline-none focus:ring-2 focus:ring-blue-500"
/>
```

### 6. Semántica HTML

Usar elementos HTML semánticos correctos:

```tsx
// ✅ Estructura semántica
<main>
  <h1>Iniciar sesión</h1>
  <form aria-label="Formulario de inicio de sesión">
    ...
  </form>
</main>

// ❌ Todo con div
<div>
  <div>Iniciar sesión</div>
  <div>...</div>
</div>
```

### 7. Dark Mode — Contraste en Ambos Temas

Al implementar dark mode, verificar contraste en ambos modos:

```tsx
// ✅ Contraste verificado en light y dark
<p className="text-gray-900 dark:text-gray-100">
  Texto principal
</p>

<p className="text-gray-600 dark:text-gray-400">
  Texto secundario — verificar contraste en dark
</p>
```

---

## Atributos ARIA Más Usados en Este Proyecto

| Atributo | Uso |
|---|---|
| `aria-required="true"` | Campos obligatorios del formulario |
| `aria-invalid="true/false"` | Estado de validación de un input |
| `aria-describedby="id"` | Relaciona input con su mensaje de error |
| `aria-label="texto"` | Descripción para elementos sin texto visible |
| `aria-live="assertive"` | Anuncia cambios de inmediato (errores) |
| `aria-live="polite"` | Anuncia cambios cuando el usuario está libre |
| `aria-busy="true"` | Indica que el elemento está cargando |
| `aria-disabled="true"` | Indica elemento deshabilitado |
| `role="alert"` | Elemento que contiene mensajes urgentes |
| `role="status"` | Mensajes no urgentes (éxito, info) |

---

## Checklist de Accesibilidad por Componente

### Formularios de Auth (Login, Register, etc.)
- [ ] Cada `<input>` tiene `<label>` con `htmlFor`
- [ ] Los campos obligatorios tienen `aria-required="true"`
- [ ] Los errores tienen `role="alert"` y están vinculados con `aria-describedby`
- [ ] El botón de submit indica estado de carga con `aria-busy`
- [ ] El formulario tiene `aria-label` descriptivo

### Páginas en General
- [ ] Estructura semántica: `<main>`, `<nav>`, `<header>`, `<footer>`
- [ ] Jerarquía de encabezados correcta (h1 → h2 → h3)
- [ ] Contraste de color ≥ 4.5:1 para texto normal
- [ ] Focus visible en todos los elementos interactivos
- [ ] Navegación completa por teclado posible

### Mensajes y Alertas
- [ ] Mensajes de éxito/error anunciados con `aria-live`
- [ ] No depender solo del color para transmitir información

---

## Herramientas de Verificación

```bash
# Instalar axe-core para tests automatizados de accesibilidad
pnpm add -D @axe-core/react

# En desarrollo, axe reporta violaciones en la consola del browser
```

También se puede usar:
- **axe DevTools** (extensión de Chrome/Firefox) — análisis automático
- **Lighthouse** (Chrome DevTools) → pestaña Accessibility
- **NVDA** (Windows) o **VoiceOver** (macOS/iOS) — pruebas con lector de pantalla
- **Color Contrast Analyzer** — verificar relaciones de contraste
