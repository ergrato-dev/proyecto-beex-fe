---
description: "Use when creating or modifying React frontend files: components, pages, hooks, context, API layer"
applyTo: "fe/src/**/*.{ts,tsx}"
---

# Reglas frontend — React + TypeScript + TailwindCSS

## REGLA 0 — Auditoría de seguridad antes de instalar paquetes

Antes de sugerir o ejecutar `pnpm add <paquete>`, verificar en [security.snyk.io](https://security.snyk.io/package/npm/<paquete>) que la versión no tenga CVEs. Usar siempre versión exacta sin `^` ni `~`. Ver protocolo completo en la sección 4.0 de `copilot-instructions.md`.

## Design system — reglas visuales

| Regla             | ✅ Correcto                                   | ❌ Incorrecto                   |
| ----------------- | --------------------------------------------- | ------------------------------- |
| Colores           | Planos y sólidos                              | `bg-gradient-to-r from-…`       |
| Fuentes           | `font-sans`, `font-medium`                    | `font-serif`, `font-mono` en UI |
| Botones de acción | `flex justify-end gap-3`                      | `flex justify-center`           |
| Dark mode         | Siempre incluir `dark:`                       | Clases solo en modo claro       |
| Transiciones      | `transition-colors duration-200`              | Sin transición en hover         |
| Bordes            | `border border-gray-200 dark:border-gray-700` | `border-black`                  |

## Accesibilidad obligatoria (WCAG AA)

- `<label htmlFor={id}>` vinculado a `<input id={id}>`
- `aria-invalid={!!error}` + `aria-describedby` en campos con error
- `role="alert"` en componentes de feedback
- `aria-hidden="true"` en íconos decorativos
- `aria-label` en botones sin texto visible

## Componentes UI disponibles

Usar siempre los del proyecto antes de crear nuevos:

```tsx
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { Alert } from "@/components/ui/Alert";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
```

## Gestión de estado en páginas

```tsx
// Patrón estándar en páginas con formulario
const [formData, setFormData] = useState({ ... });
const [error, setError]       = useState<string | null>(null);
const [isLoading, setIsLoading] = useState(false);

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  setError(null); // limpiar error al escribir
};
```

## API layer

- Todas las llamadas HTTP van en `fe/src/api/auth.ts` — nunca axios inline en componentes
- Errores capturados con `err instanceof Error ? err.message : 'Error desconocido'`
- El interceptor en `fe/src/api/axios.ts` inyecta el JWT automáticamente

## Comentarios obligatorios

Cabecera en cada archivo nuevo:

```tsx
/**
 * Archivo: NombreComponente.tsx
 * Descripción: qué hace
 * ¿Para qué? propósito en la UI
 * ¿Impacto? qué se rompe si falta
 */
```
