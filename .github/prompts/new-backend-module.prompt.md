---
description: "Crea un módulo backend completo en Express.js siguiendo el patrón Router→Controller→Service→Schema del proyecto"
name: "Nuevo módulo backend"
argument-hint: "Nombre del módulo (ej: products, roles, notifications)"
agent: "agent"
---

Crea un módulo backend completo en `be/src/modules/$arg/` siguiendo exactamente el patrón establecido en el proyecto.

## Archivos a generar

1. **`$arg.schema.ts`** — Schemas Zod para validación de request/response
2. **`$arg.service.ts`** — Lógica de negocio (acceso a BD con Prisma, errores tipados)
3. **`$arg.controller.ts`** — Handlers HTTP delgados que delegan al service
4. **`$arg.router.ts`** — Router Express con middlewares `validate()` y `authenticate()`

## Reglas obligatorias

- Cabecera de archivo en cada uno (¿Qué? ¿Para qué? ¿Impacto?)
- Comentarios pedagógicos en cada bloque significativo
- Tipos TypeScript explícitos en todos los parámetros y retornos
- Errores lanzados con clases tipadas: `AppError`, `ConflictError`, `NotFoundError`, `UnauthorizedError`
- Endpoints bajo `/api/v1/$arg/`
- Prisma Client (`db` en `be/src/db/index.ts`) para toda operación de BD — nunca raw SQL
- Exportar el router y registrarlo en `be/src/app.ts`

## Referencia de patrón existente

Lee [be/src/modules/auth/auth.service.ts](../../be/src/modules/auth/auth.service.ts) y
[be/src/modules/auth/auth.controller.ts](../../be/src/modules/auth/auth.controller.ts) como modelo base.

Describe el módulo que debo crear: $arg
