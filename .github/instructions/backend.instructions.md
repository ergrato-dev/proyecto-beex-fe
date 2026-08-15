---
description: "Use when creating or modifying backend Express.js files: services, controllers, routers, middlewares, utilities, DB schema"
applyTo: "be/src/**/*.ts"
---

# Reglas backend — Express.js + TypeScript

## REGLA 0 — Auditoría de seguridad antes de instalar paquetes

Antes de sugerir o ejecutar `pnpm add <paquete>`, verificar en [security.snyk.io](https://security.snyk.io/package/npm/<paquete>) que la versión no tenga CVEs. Usar siempre versión exacta sin `^` ni `~`. Ver protocolo completo en la sección 4.0 de `copilot-instructions.md`.

## Patrón arquitectónico obligatorio

```
Router → Controller → Service → DB (Prisma ORM)
```

- **Router**: solo registra rutas con `validate()` y `authenticate()`, ninguna lógica
- **Controller**: solo extrae `req.body`/`req.params`, llama al service, responde con `res.json()`
- **Service**: toda la lógica de negocio; accede a BD; lanza errores tipados
- **DB**: solo mediante Prisma Client (`db` en `src/db/index.ts`) — nunca raw SQL sin
  parametrizar. Cambios de schema van en `prisma/schema.prisma` + `pnpm db:migrate:dev`,
  nunca alterando la BD a mano.

## Manejo de errores

Lanzar siempre con clases tipadas del proyecto:

```typescript
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
} from "@/middlewares/error.middleware.js";

throw new ConflictError("Email already registered");
throw new UnauthorizedError("Invalid credentials");
throw new NotFoundError("User not found");
```

El `errorHandler` en `app.ts` los captura y serializa automáticamente.

## Comentarios obligatorios

Cada bloque significativo debe responder:

```typescript
// ¿Qué? Descripción de qué hace este bloque
// ¿Para qué? Por qué existe — motivación
// ¿Impacto? Qué pasa si se omite o implementa mal
```

Cabecera en cada archivo nuevo:

```typescript
/**
 * Archivo: nombre.ts
 * Descripción: qué hace este archivo
 * ¿Para qué? propósito en el sistema
 * ¿Impacto? consecuencias si falla
 */
```

## Seguridad

- Nunca loggear passwords, tokens ni datos sensibles
- Validar siempre con Zod antes de procesar (`validate()` middleware)
- Credenciales exclusivamente desde `config.ts` — nunca hardcodeadas
- Mensajes de error de auth genéricos — no revelar si un email existe
