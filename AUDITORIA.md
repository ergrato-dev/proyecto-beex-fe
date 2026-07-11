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

Stack vigente: Express 5, TypeScript, Drizzle ORM + PostgreSQL, React 19/Vite/TS. Buen
contraste pedagógico con FastAPI (ORM tipo query-builder vs ORM declarativo, middleware
explícito vs dependency injection). ✅

## Completitud

Gaps identificados — **quedan documentados, no se corrigen en esta ronda**:

- `.github/workflows/` solo tiene `close-prs.yml` (bot). No hay CI que corra tests/lint/build.
- Backend: un solo archivo de test (`be/src/tests/auth.test.ts`, ~37 casos) — cubre bien el
  flujo de auth pero no hay tests para `users.controller.ts`/`users.service.ts` (perfil, locale)
  fuera de ese archivo.
- `docker-compose.yml` solo levanta `db` + `mailpit` — no hay Dockerfiles para `be`/`fe` ni
  contenedor de nginx, a diferencia del repo FastAPI de referencia que sí conteneriza todo el
  stack. Es una decisión de diseño documentada en `docs/setup/con-docker.md` (be/fe corren
  nativos con `pnpm dev`), pero rompe la paridad "docker compose up y ya" que sí tiene el repo
  FastAPI — vale la pena decidir si se homologa.
- No existe `.pre-commit-config.yaml` pese a que hay lint configurado (ESLint/Prettier en fe,
  probablemente equivalente en be — verificar).
- No hay `scripts/start.sh`/`stop.sh` como en el repo FastAPI de referencia.

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

## Próximos pasos sugeridos (fuera de alcance de esta ronda)

1. Agregar workflow de CI que corra lint + tests de `be/` y `fe/` en cada PR.
2. Tests para `users.controller.ts`/`users.service.ts` (fuera del flujo de auth puro).
3. Decidir si se homologa la contenerización completa (Dockerfiles be/fe) con el repo FastAPI o
   se mantiene la decisión actual de correr be/fe nativos.
4. `.pre-commit-config.yaml` reutilizando el lint ya configurado.
5. Comunicar a cualquier aprendiz que haya clonado `main` antes del merge de `dev` que debe
   re-sincronizar su fork.
6. Una vez resueltos 1-4, replicar el mismo patrón en el resto de `proyecto-*`.
