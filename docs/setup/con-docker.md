# Setup con Docker — NN Auth System (Express Edition)

<!--
  ¿Qué? Guía paso a paso para levantar la base de datos y el servidor de email
         usando Docker Compose, y correr el backend y frontend de forma nativa.
  ¿Para qué? Docker gestiona los servicios de infraestructura (PostgreSQL + Mailpit)
             de forma aislada y reproducible, sin contaminar el sistema operativo.
  ¿Impacto? Es el modo recomendado para desarrollo: Node.js y pnpm corren nativamente
             (hot-reload inmediato), y los servicios de infraestructura viven en Docker.
-->

> **Modo recomendado para:** desarrollo activo con hot-reload, depuración con IDE,
> demostraciones y entornos de clase.

## Opción rápida — todo en Docker (sin instalar Node.js)

Si solo querés levantar el sistema completo para probarlo (sin hot-reload ni editar código),
`docker-compose.yml` también construye `be` y `fe` como contenedores:

```bash
./scripts/start.sh
# o manualmente:
docker compose up --build -d
```

Esto expone lo mismo que el flujo nativo de abajo: frontend en `http://localhost:5173`,
API en `http://localhost:3000`, Mailpit en `http://localhost:8025`. Para detener todo:
`./scripts/stop.sh` (o `docker compose down`).

El resto de esta guía describe el flujo **recomendado para desarrollo**: Docker solo para
infraestructura, `be`/`fe` corriendo nativos con `pnpm dev` (hot-reload inmediato).

En este stack, Docker solo gestiona la infraestructura:

| Servicio   | Dónde corre             | URL / Puerto          |
| ---------- | ----------------------- | --------------------- |
| `db`       | Contenedor Docker       | `localhost:5432`      |
| `mailpit`  | Contenedor Docker       | http://localhost:8025 |
| Backend    | `pnpm dev` (nativo)     | http://localhost:3000 |
| Frontend   | `pnpm dev` (nativo)     | http://localhost:5173 |

---

## Prerrequisitos

Antes de comenzar, instala estas herramientas:

| Herramienta        | Versión mínima | Verificar con            | Descargar                                                              |
| ------------------ | -------------- | ------------------------ | ---------------------------------------------------------------------- |
| **Docker**         | 24+            | `docker --version`       | https://docs.docker.com/get-docker/                                    |
| **Docker Compose** | 2.20+          | `docker compose version` | Incluido con Docker Desktop                                            |
| **Node.js**        | 20 LTS+        | `node --version`         | https://nodejs.org/                                                    |
| **pnpm**           | 9+             | `pnpm --version`         | `corepack enable && corepack prepare pnpm@latest --activate`           |
| **Git**            | 2.40+          | `git --version`          | https://git-scm.com/downloads                                          |

> ⚠️ **Windows**: Docker Desktop requiere WSL2 habilitado.
> Seguir la guía oficial: https://docs.docker.com/desktop/install/windows-install/

> ⚠️ **Nunca usar `npm` ni `yarn`** — solo `pnpm` para instalar dependencias de Node.js.

### Instalar pnpm (si no lo tienes)

```bash
# Opción recomendada — vía corepack (incluido con Node.js 16+)
corepack enable
corepack prepare pnpm@latest --activate

# Alternativa — instalación independiente
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

---

## Paso 1 — Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd proyecto-beex-fe
```

Verificar la estructura básica:

```bash
ls
# Deberías ver: be/  fe/  docker-compose.yml  README.md  ...
```

---

## Paso 2 — Levantar la infraestructura con Docker

```bash
# Inicia PostgreSQL y Mailpit en segundo plano (sin construir be/fe)
docker compose up -d db mailpit
```

Verificar que los contenedores están sanos:

```bash
docker compose ps
```

Deberías ver:

```
NAME               IMAGE                    STATUS
nn_auth_db        postgres:17-alpine        Up (healthy)
nn_auth_mailpit   axllent/mailpit:latest    Up
```

> Si `nn_auth_db` aparece como `starting` espera unos segundos y repite `docker compose ps`.
> El healthcheck confirma que PostgreSQL está listo para aceptar conexiones.

---

## Paso 3 — Configurar el Backend

### 3.1 Instalar dependencias

```bash
cd be
pnpm install
```

### 3.2 Configurar variables de entorno

```bash
cp .env.example .env
```

El archivo `.env` ya tiene los valores correctos para Docker local. Verifica el contenido:

```bash
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://nn_user:nn_password@localhost:5432/nn_auth_db
JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-chars-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_FROM=noreply@nn-company.com
FRONTEND_URL=http://localhost:5173
```

**Generar secrets JWT seguros (recomendado):**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copiar el resultado en JWT_ACCESS_SECRET=
# Repetir para JWT_REFRESH_SECRET= (usar un valor diferente)
```

### 3.3 Generar el cliente de Prisma y ejecutar las migraciones

```bash
# Desde be/ — con Docker corriendo
pnpm db:generate
pnpm db:migrate
```

Deberías ver algo como:

```
Applying migration `20260815000000_init`
All migrations have been successfully applied.
```

Verificar que las tablas se crearon:

```bash
docker compose exec db psql -U nn_user -d nn_auth_db -c "\dt"
# Deberías ver: email_verification_tokens, password_reset_tokens, users
```

---

## Paso 4 — Configurar el Frontend

```bash
cd ../fe    # o `cd fe` desde la raíz del proyecto
pnpm install
cp .env.example .env
```

El archivo `fe/.env` ya apunta al backend en el puerto correcto:

```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

---

## Paso 5 — Levantar el sistema (2 terminales)

### Terminal 1 — Backend (Express + tsx --watch)

```bash
cd be
pnpm dev
```

Salida esperada:

```
🚀 Servidor corriendo en http://localhost:3000
🌍 Entorno: development
```

URLs disponibles:

- API: http://localhost:3000
- Health check: http://localhost:3000/health

### Terminal 2 — Frontend (React + Vite)

```bash
cd fe
pnpm dev
```

Salida esperada:

```
  VITE v8.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## Paso 6 — Verificar que todo funciona

Abrir en el navegador:

| URL                        | Qué muestra                              |
| -------------------------- | ---------------------------------------- |
| http://localhost:5173      | Landing page del frontend                |
| http://localhost:3000/health | JSON `{"status":"ok","timestamp":"..."}` |
| http://localhost:8025      | Mailpit — bandeja de emails capturados   |

Probar la API directamente:

```bash
# Verificar que la API responde
curl http://localhost:3000/health
# → {"status":"ok","timestamp":"2026-..."}

# Registrar un usuario de prueba
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","fullName":"Test User","password":"Test1234"}'
```

Después del registro, ir a http://localhost:8025 para ver el email de verificación.

---

## Paso 7 — Comandos útiles del día a día

```bash
# ─── Docker — infraestructura ───
docker compose up -d db mailpit  # levantar PostgreSQL + Mailpit
docker compose stop              # detener sin perder datos
docker compose start             # volver a iniciar
docker compose down              # detener y eliminar contenedores (datos en volumen persisten)
docker compose down -v           # ídem + borra el volumen → ¡se pierden datos de la BD!

# ─── Ver logs de infraestructura ───
docker compose logs -f           # todos los servicios
docker compose logs -f db        # solo PostgreSQL
docker compose logs -f mailpit   # solo Mailpit

# ─── Consola de PostgreSQL ───
docker compose exec db psql -U nn_user -d nn_auth_db

# ─── Backend ───
cd be
pnpm dev             # servidor con hot-reload
pnpm test            # todos los tests
pnpm test:coverage   # tests con cobertura
pnpm lint            # verificar errores de ESLint
pnpm format          # formatear con Prettier
pnpm build           # compilar TypeScript → dist/

# ─── Prisma ORM ───
pnpm db:generate     # regenerar el cliente de Prisma desde el schema
pnpm db:migrate:dev  # crear + aplicar una migración nueva (desarrollo)
pnpm db:migrate      # aplicar migraciones existentes sin crear una nueva (CI/prod)
pnpm db:studio       # abrir Prisma Studio (GUI para la BD)
pnpm db:status       # ver estado de las migraciones

# ─── Frontend ───
cd fe
pnpm dev             # dev server con hot-reload
pnpm test            # todos los tests
pnpm test:coverage   # tests con cobertura
pnpm lint            # verificar errores de ESLint
pnpm build           # compilar para producción → dist/
```

---

## Paso 8 — Ejecutar tests

### Backend

```bash
cd be

# Todos los tests (requiere Docker corriendo — PostgreSQL activo)
pnpm test

# Con cobertura
pnpm test:coverage

# En modo watch (re-ejecuta al guardar)
pnpm test:watch
```

### Frontend

```bash
cd fe

# Todos los tests (no requiere Docker)
pnpm test

# Con cobertura
pnpm test:coverage

# En modo watch
pnpm test:watch
```

---

## Paso 9 — Solución de problemas comunes

### Error "connect ECONNREFUSED 127.0.0.1:5432"

PostgreSQL no está corriendo o no está listo todavía.

```bash
# Verificar que Docker está corriendo
docker compose ps

# Si nn_auth_db no aparece, levantarlo:
docker compose up -d db mailpit

# Esperar al healthcheck
docker compose ps   # STATUS debe ser "Up (healthy)"
```

### Error "port is already in use"

Otro proceso usa el puerto 5432 o 3000.

```bash
# Verificar qué proceso usa el puerto
sudo lsof -i :5432
sudo lsof -i :3000

# Detener el proceso
sudo kill -9 <PID>
```

Si tienes PostgreSQL instalado localmente y está corriendo en 5432:

```bash
# Linux — detener el servicio local
sudo systemctl stop postgresql

# macOS
brew services stop postgresql@17
```

### Los emails no aparecen en Mailpit (http://localhost:8025)

```bash
# Verificar que Mailpit está corriendo
docker compose ps mailpit

# Verificar las variables en be/.env
grep MAIL be/.env
# MAIL_HOST=localhost
# MAIL_PORT=1025

# Ver logs del backend para confirmar el envío
# (en la terminal donde corre pnpm dev)
```

### Error en las migraciones: "relation already exists"

```bash
# Ver estado actual de las migraciones
cd be && pnpm db:status

# Si la BD tiene tablas de una sesión anterior y quieres reiniciar desde cero:
docker compose down -v   # ⚠️ borra TODOS los datos
docker compose up -d db mailpit
pnpm db:migrate
```

### Reconstruir desde cero (reset total)

```bash
docker compose down -v
docker compose up -d db mailpit
cd be && pnpm db:migrate
```

---

## Resumen rápido

```bash
# Setup inicial (una sola vez)
git clone <url> && cd proyecto-beex-fe
docker compose up -d db mailpit
cd be && pnpm install && cp .env.example .env && pnpm db:migrate
cd ../fe && pnpm install && cp .env.example .env

# Levantar (terminales separadas)
cd be && pnpm dev          # Terminal 1 → http://localhost:3000
cd fe && pnpm dev          # Terminal 2 → http://localhost:5173
# Docker ya corre PostgreSQL + Mailpit en segundo plano

# Verificar
curl http://localhost:3000/health
# Abrir http://localhost:5173
# Correos en http://localhost:8025
```
