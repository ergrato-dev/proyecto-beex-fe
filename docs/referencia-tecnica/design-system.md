# Design System — NN Auth System (FE)

<!--
  ¿Qué? Guía del design system del frontend compartido entre todos los stacks del sistema educativo.
  ¿Para qué? Documentar las decisiones de diseño, el sistema de color de marca y cómo adaptar
    el FE a un nuevo stack cambiando el mínimo de código posible.
  ¿Impacto? Sin esta guía cada stack podría aplicar colores de forma inconsistente,
    rompiendo la identidad visual y dificultando el mantenimiento futuro.
-->

## 1. Principios de diseño

| Principio       | Regla aplicada                                                            |
| --------------- | ------------------------------------------------------------------------- |
| Minimalismo     | Solo los elementos necesarios — sin decoración innecesaria                |
| Color plano     | Cero degradados (`gradient`) en ningún lugar de la aplicación             |
| Tipografía      | `system-ui` + `Segoe UI` + `Roboto` — sans-serif siempre                 |
| Consistencia    | Escala de spacing de Tailwind (p-4, gap-6, space-y-4) — sin valores ad hoc|
| Accesibilidad   | WCAG AA: contraste mínimo 4.5:1 en texto, `aria-*` en elementos críticos |
| Mobile-first    | Formularios de auth utilizables desde 320px de ancho                     |

---

## 2. Sistema de temas — Dark y Light

El FE soporta dos temas controlados por el usuario (no por `prefers-color-scheme`).

### Mecanismo

```css
/* fe/src/index.css */
@custom-variant dark (&:where(.dark, .dark *));
```

El `ThemeToggle` añade o quita la clase `.dark` en `<html>`. Persiste en `localStorage`.

### Paletas

| Contexto                  | Light           | Dark          |
| ------------------------- | --------------- | ------------- |
| Fondo de página (body)    | `white`         | `slate-950`   |
| Fondo navbar / footer     | `white`         | `slate-900`   |
| Fondo cards               | `white`         | `slate-900`   |
| Fondo inputs              | `white`         | `slate-800`   |
| Texto principal           | `gray-900`      | `slate-100`   |
| Texto secundario          | `gray-500`      | `slate-400`   |
| Bordes                    | `gray-200`      | `slate-700/800`|

**¿Por qué `slate` en dark y `gray` en light?**
`slate` tiene un subtono azul sutil (`slate-900` = `#0f172a`) que da personalidad al dark mode
sin necesidad de degradados. `gray` en light es neutro y limpio.

---

## 3. Sistema de color de marca (`brand-*`)

### ¿Por qué `brand-*` y no `blue-*`?

Cada proyecto del sistema educativo tiene un color de acento distinto para que el alumno
identifique visualmente en qué stack está trabajando. Hardcodear `blue-*` en los componentes
impediría reutilizar el FE — habría que buscar y reemplazar en decenas de archivos.

Con el sistema `brand-*`, **cambiar de stack requiere editar 4 líneas en un solo archivo**.

### Colores asignados por stack

| Stack                  | Proyecto              | Color Tailwind | Matiz visual          |
| ---------------------- | --------------------- | -------------- | --------------------- |
| **Express.js**         | `proyecto-beex-fe`    | `blue`         | Azul clásico Node.js  |
| **FastAPI**            | `proyecto-be_fastapi-fe_react` | `emerald`      | Verde teal de Python  |
| **Next.js fullstack**  | `proyecto-be-fe-next` | `violet`       | Violeta moderno       |
| **Spring Boot Java**   | `proyecto-besb-fe`    | `amber`        | Naranja del ecosistema Java |
| **Spring Boot Kotlin** | `proyecto-besbk-fe`   | `fuchsia`      | Magenta del logo Kotlin |
| **Go REST API**        | `proyecto-bego-fe`    | `cyan`         | Cian del Gopher oficial |

### Shades utilizados

| Variable CSS          | Tailwind equivalente | Uso típico                                 |
| --------------------- | -------------------- | ------------------------------------------ |
| `--color-brand-400`   | `blue-400` etc.      | Dark mode: íconos, links, focus rings      |
| `--color-brand-500`   | `blue-500` etc.      | Borde del logo SVG, color de íconos neutro |
| `--color-brand-600`   | `blue-600` etc.      | Botones primarios en light mode            |
| `--color-brand-800`   | `blue-800` etc.      | Fondo de badges de color en light mode     |

---

## 4. Cómo adaptar el FE a otro stack

### Paso 1 — Cambiar el bloque `@theme` en `fe/src/index.css`

```css
/* ── Express.js (azul) — este proyecto ──────────────── */
@theme {
  --color-brand-400: var(--color-blue-400);
  --color-brand-500: var(--color-blue-500);
  --color-brand-600: var(--color-blue-600);
  --color-brand-800: var(--color-blue-800);
}

/* ── FastAPI (esmeralda) ─────────────────────────────── */
@theme {
  --color-brand-400: var(--color-emerald-400);
  --color-brand-500: var(--color-emerald-500);
  --color-brand-600: var(--color-emerald-600);
  --color-brand-800: var(--color-emerald-800);
}

/* ── Next.js fullstack (violeta) ─────────────────────── */
@theme {
  --color-brand-400: var(--color-violet-400);
  --color-brand-500: var(--color-violet-500);
  --color-brand-600: var(--color-violet-600);
  --color-brand-800: var(--color-violet-800);
}

/* ── Spring Boot Java (ámbar) ────────────────────────── */
@theme {
  --color-brand-400: var(--color-amber-400);
  --color-brand-500: var(--color-amber-500);
  --color-brand-600: var(--color-amber-600);
  --color-brand-800: var(--color-amber-800);
}

/* ── Spring Boot Kotlin (fucsia) ─────────────────────── */
@theme {
  --color-brand-400: var(--color-fuchsia-400);
  --color-brand-500: var(--color-fuchsia-500);
  --color-brand-600: var(--color-fuchsia-600);
  --color-brand-800: var(--color-fuchsia-800);
}

/* ── Go REST API (cian) ──────────────────────────────── */
@theme {
  --color-brand-400: var(--color-cyan-400);
  --color-brand-500: var(--color-cyan-500);
  --color-brand-600: var(--color-cyan-600);
  --color-brand-800: var(--color-cyan-800);
}
```

### Paso 2 — Actualizar el nombre del stack en `LandingPage.tsx`

```tsx
// Cambiar "Express" por el nombre del nuevo stack en el título del hero
<h1>
  {t('landing.title')}{' '}
  <span className="text-brand-600 dark:text-brand-500">Express</span>  {/* ← cambiar */}
</h1>
```

### Paso 3 — Actualizar el tech stack en `LandingPage.tsx`

```tsx
// Reemplazar las tecnologías de la lista techStack
const techStack = [
  'Node.js 20',
  'Express.js 5',   // ← cambiar por el backend del nuevo stack
  'TypeScript',
  // ...
] as const;
```

### Paso 4 — Actualizar textos en i18n (`es.ts` / `en.ts`)

Actualizar `landing.subtitle` y `landing.features.owasp.description` para mencionar
las herramientas correctas del nuevo stack (e.g. Pydantic en vez de Zod para FastAPI).

### Verificación

```bash
# Después del cambio, verificar que no queden colores hardcodeados del stack anterior
grep -rn "blue-\|emerald-\|violet-\|amber-\|fuchsia-\|cyan-" fe/src --include="*.tsx" --include="*.ts"
# El resultado debe mostrar CERO ocurrencias (solo brand-* debe aparecer)
```

---

## 5. Reglas de uso en componentes

### ✅ Correcto — usar `brand-*`

```tsx
{/* Botón primario */}
<button className="bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 text-white rounded-lg px-4 py-2 transition-colors">
  Guardar
</button>

{/* Link de acento */}
<Link className="text-brand-600 dark:text-brand-400 hover:underline">
  ¿Olvidaste tu contraseña?
</Link>

{/* Focus ring accesible */}
<input className="focus:ring-2 focus:ring-brand-500 focus:outline-none" />

{/* Ícono */}
<ShieldCheck className="text-brand-600 dark:text-brand-500" />
```

### ❌ Incorrecto — color hardcodeado

```tsx
{/* Rompe el sistema de marca — si el stack cambia, este botón queda con el color incorrecto */}
<button className="bg-blue-600 hover:bg-blue-700 text-white">
  Guardar
</button>
```

---

## 6. Logo SVG (`NNAuthLogo`)

El componente `NNAuthLogo` en `LandingPage.tsx` usa variables CSS para sus colores:

```tsx
<rect ... stroke="var(--color-brand-500)" />
<polyline ... stroke="var(--color-brand-400)" />
```

Al cambiar el `@theme` en `index.css`, el logo también cambia automáticamente.
El fondo (`fill="#0f172a"` = `slate-950`) es fijo — encaja con cualquier color de acento.

---

## 7. Estructura de elevación en dark mode

```
slate-950  →  Fondo de página (el "vacío" del fondo)
slate-900  →  Navbar, Footer, Cards (superficies flotantes)
slate-800  →  Inputs, code blocks (superficie interactiva)
slate-700  →  Bordes en dark mode (separadores visibles)
brand-400  →  Íconos, links, focus rings en dark (acento claro)
brand-600  →  Botones, CTA en light (acento saturado)
```
