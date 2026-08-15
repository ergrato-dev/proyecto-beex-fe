# 🔍 Auditoría del repo (piloto para replicar en el resto de `proyecto-*`)

<!--
  ¿Qué? Auditoría en 5 ejes de este repo, siguiendo el mismo patrón aplicado en
  proyecto-be_fastapi-fe_react.
  ¿Para qué? Servir de checklist reutilizable antes de replicar este mismo patrón
  (bitácora + auditoría + nombre representativo del stack) en los demás repos proyecto-*.
  ¿Impacto? Sin esto, los gaps de este repo se replicarían silenciosamente en el resto en
  vez de corregirse primero.
-->

Fecha de la auditoría: 2026-07-11. Repo evaluado justo después de mergear `origin/dev` a `main`.

> **Actualización 2026-08-14**: se resolvieron 3 de los gaps de la sección "Completitud"
> (Docker completo, `scripts/start.sh`/`stop.sh`, migración Drizzle→Prisma) y se agregó la
> sección [Auditoría de CVEs](#-auditoría-de-cves) más abajo. El resto de los gaps
> (CI, tests de `users.*`, `.pre-commit-config.yaml`) sigue fuera de alcance.

## Hallazgo previo a la auditoría — split de ramas

`main` tenía solo 4 commits (scaffold de Vite sin tocar, sin README, sin `docs/`) mientras
`origin/dev` tenía 26 commits con la implementación completa (auth + email verification + audit
logging + dashboard real + i18n + docs completos), nunca mergeados. Se hizo merge de `dev` a
`main` (commit `e1b21d3`) preservando los 2 commits CI-only que solo existían en `main`
(`close-prs.yml`), sin conflictos. Esta auditoría evalúa el resultado post-merge.

**Riesgo a vigilar**: si existen aprendices con forks/clones hechos a partir de `main` antes de
este merge, deben re-sincronizar — su base era el scaffold vacío, no el proyecto real.

## Pertinencia

Alineado al RAP — tiene HUs (10) y RFs (8) en [`docs/requisitos/`](docs/requisitos/) y
arquitectura documentada en [`docs/referencia-tecnica/`](docs/referencia-tecnica/). ✅

## Relevancia

Stack vigente: Express 5, TypeScript, Prisma ORM + PostgreSQL, React 19/Vite/TS. Buen
contraste pedagógico con FastAPI (ORM declarativo con motor propio vs SQLAlchemy, middleware
explícito vs dependency injection). ✅

> Migrado de Drizzle a Prisma el 2026-08-14 — ver [Auditoría de CVEs](#-auditoría-de-cves):
> la versión de Drizzle usada tenía un CVE de SQL injection sin parchear.

## Completitud

Gaps identificados — **quedan documentados, no se corrigen en esta ronda**:

- `.github/workflows/` solo tiene `close-prs.yml` (bot). No hay CI que corra tests/lint/build.
- Backend: un solo archivo de test (`be/src/tests/auth.test.ts`, ~37 casos) — cubre bien el
  flujo de auth pero no hay tests para `users.controller.ts`/`users.service.ts` (perfil, locale)
  fuera de ese archivo.
- No existe `.pre-commit-config.yaml` pese a que hay lint configurado (ESLint/Prettier en fe;
  en `be` falta directamente `eslint.config.js` — `pnpm lint` no corre, gap preexistente sin
  relación con esta ronda).

**Resuelto 2026-08-14**: `docker-compose.yml` ahora levanta el stack completo (`db`+`mailpit`+
`be`+`fe`) con `be/Dockerfile`/`fe/Dockerfile`/`fe/nginx.conf`, igualando la paridad del repo
FastAPI de referencia. Se agregaron `scripts/start.sh`/`stop.sh` con el mismo patrón de
healthcheck-polling que el repo FastAPI.

## Actualidad

Post-merge, el commit más reciente es de la integración de hoy; el contenido real (última
feature) es de `dev` con fecha ~2026-04-19 (~3 meses antes de esta auditoría) — más antiguo que
el repo FastAPI (10 días), pero ya no es scaffold vacío. ✅ tras el merge.

## Seguridad

En general sólido:

- Password hashing con `bcryptjs`.
- JWT con secrets separados para access/refresh (`JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET`),
  ambos con validación Zod de longitud mínima 32 caracteres en `be/src/config.ts`.
- CORS configurado explícitamente en `be/src/app.ts` (origen acotado vía `FRONTEND_URL`).
- Rate limiting (`express-rate-limit`) en `be/src/app.ts`.
- Audit log de eventos de seguridad (`be/src/utils/audit-log.ts`): login success/failed,
  password changed/reset, email verified, rate-limit hits.
- Validación de input con `zod` en los módulos de auth (`auth.schema.ts`).
- `helmet` habilitado para headers de seguridad HTTP.

Hallazgos a documentar (mismo patrón que en el repo FastAPI — dev-only, advertido pero debe
quedar explícito):

- `docker-compose.yml` trae hardcodeadas credenciales de DB en texto plano
  (`nn_user`/`nn_password`) — correcto para desarrollo, agregar comentario explícito
  "no copiar a prod".
- `be/.env.example` usa placeholders de secretos con el string literal
  `your-super-secret-...-change-in-production` — igual de correcto que el patrón del repo
  FastAPI, sin acción requerida.

## 🛡️ Auditoría de CVEs

Ejecutada el 2026-08-14 con `pnpm audit --json` sobre `be/` y `fe/` (versiones reales del
lockfile en ese momento, antes de los bumps de esta misma ronda). Metodología: mismo enfoque
que `.github/prompts/audit-package.prompt.md` (fuente de verdad = advisories del propio
registro de pnpm) pero aplicado a **todo el árbol de dependencias instalado**, no a un paquete
nuevo antes de instalarlo.

### Hallazgos de producción (acción tomada)

| Paquete | Severidad | Detalle | Acción |
|---|---|---|---|
| `drizzle-orm@0.40.1` | **High** (SQL injection, CWE-89) | GHSA-gpj5-g38j-94v9 — identificadores SQL mal escapados | Eliminado — migración completa a Prisma (ver sección Relevancia) |
| `nodemailer@8.0.4` | **High** | GHSA-p6gq-j5cr-w38f — vulnerable en toda la serie `<=9.0.0` | Bump a `9.0.5` (cambio de major; se verificó que la API `createTransport`/`sendMail` usada en `be/src/utils/email.ts` no cambió) |
| `axios@1.14.0` | Moderate (SSRF vía NO_PROXY) | GHSA-3p68-rc4w-qgx5 | Bump a `1.19.0` |
| `react-router-dom@7.14.0` (vía `react-router`) | **High** (CSRF bypass) | GHSA-qwww-vcr4-c8h2, + varios moderados/altos en el rango `<7.18.2` | Bump a `7.18.2` |
| `qs`, `body-parser`, `form-data` (transitivos vía `express`/`supertest`) | Moderate/Low | DoS, redirect de contenido | Resueltos con `pnpm update` dentro del rango ya declarado por `express`/`supertest` — no fue necesario `pnpm.overrides` |
| `dompurify` (transitivo vía `jspdf`, optional) | Moderate/Low (varios) | XSS bypass, varias versiones | Resuelto con `pnpm update dompurify` (rango `^3.3.1` de `jspdf` ya lo permitía) |

### Hallazgos solo en devDependencies (build tools, sin exposición en producción)

| Paquete | Severidad | Acción |
|---|---|---|
| `vite@8.0.3` | High/Moderate (path traversal, fs bypass — solo dev server) | Bump a `8.2.1` |
| `esbuild` (transitivo vía Vite/tsx) | Low | Quedó anclado en `0.27.x` pese a `pnpm update` — igual que el CVE histórico de `esbuild` documentado en `copilot-instructions.md` (línea ~258). Forzado a `0.28.2` vía `overrides` en `pnpm-workspace.yaml` |
| `postcss`, `undici`, `@babel/core` (transitivos) | Moderate/Low | Resueltos con `pnpm update` dentro de los rangos ya declarados por sus paquetes padre |
| `js-yaml`, `brace-expansion` (transitivos vía ESLint) | High/Moderate | Resueltos con `pnpm update` — no requirió tocar la versión de ESLint |

### Estado final

`pnpm audit` sobre `be/` y `fe/` (post-bumps, mismo commit que esta auditoría): **0 advisories**
en ambos. Verificado con `pnpm test` (37 tests `be` + 67 tests `fe`, todos en verde) y
`docker compose up --build` end-to-end (registro + email de verificación capturado en Mailpit)
después de aplicar los bumps.

## Próximos pasos sugeridos (fuera de alcance de esta ronda)

1. Agregar workflow de CI que corra lint + tests de `be/` y `fe/` en cada PR (y, ya que se
   ejecuta en cada PR, correr `pnpm audit` ahí mismo en vez de solo manualmente).
2. Tests para `users.controller.ts`/`users.service.ts` (fuera del flujo de auth puro).
3. `.pre-commit-config.yaml` reutilizando el lint ya configurado — y agregar el
   `eslint.config.js` faltante en `be/` para que `pnpm lint` funcione ahí.
4. Comunicar a cualquier aprendiz que haya clonado `main` antes del merge de `dev` que debe
   re-sincronizar su fork.
5. Una vez resueltos 1-3, replicar el mismo patrón en el resto de `proyecto-*`.
