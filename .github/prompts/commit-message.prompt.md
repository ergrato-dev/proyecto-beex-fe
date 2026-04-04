---
description: "Genera un mensaje de commit en formato Conventional Commits con cuerpo pedagógico What/For/Impact a partir de los cambios actuales"
name: "Mensaje de commit"
argument-hint: "Descripción breve de los cambios realizados (o deja vacío para analizar el diff)"
agent: "agent"
tools: ["changes"]
---

Genera un mensaje de commit siguiendo el formato **Conventional Commits** con cuerpo pedagógico obligatorio del proyecto.

## Formato requerido

```
type(scope): short description in english  ← máx 72 chars, imperativo

For: reason this change was needed
Impact: what this affects or enables
```

## Tipos permitidos

| Tipo       | Cuándo usarlo                              |
| ---------- | ------------------------------------------ |
| `feat`     | Nueva funcionalidad visible al usuario     |
| `fix`      | Corrección de bug                          |
| `chore`    | Mantenimiento, configuración, dependencias |
| `docs`     | Solo documentación                         |
| `refactor` | Reestructuración sin cambiar funcionalidad |
| `test`     | Agregar o corregir tests                   |
| `style`    | Formato, espacios (no afecta lógica)       |
| `ci`       | Cambios en CI/CD                           |
| `perf`     | Mejoras de rendimiento                     |

## Scopes del proyecto

`auth` · `user` · `db` · `api` · `ui` · `config` · `test` · `deps`

## Ejemplos de referencia

```
feat(auth): add password reset endpoint

For: users who forget their password need a recovery flow
Impact: enables POST /api/v1/auth/reset-password; stores token in password_reset_tokens table
```

```
fix(ui): show generic error on forgot password to prevent user enumeration

For: revealing whether an email exists is an OWASP security risk
Impact: ForgotPasswordPage now always shows success message regardless of result
```

## Instrucciones

1. Analiza los cambios actuales del repositorio con la herramienta `changes`
2. Determina el tipo y scope más apropiados
3. Escribe el subject en inglés, imperativo, máx 72 caracteres
4. Escribe `For:` explicando la motivación
5. Escribe `Impact:` explicando el efecto técnico

## Estrategia de ramas del proyecto

Este proyecto usa **solo dos ramas**: `main` y `dev`.

- Los commits van siempre a `dev` — nunca directamente a `main`
- `main` solo recibe merges desde `dev` cuando todos los tests pasan
- Si los cambios actuales son un merge de `dev` a `main`, usar: `chore(release): merge dev into main`

Contexto adicional: $arg
