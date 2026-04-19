# Setup sin Docker — NN Auth System (Express Edition)

<!--
  ¿Qué? Guía paso a paso para correr el proyecto instalando PostgreSQL y
         Node.js directamente en el sistema operativo, sin usar Docker.
  ¿Para qué? Útil cuando Docker no está disponible o cuando se prefiere
             control total sobre cada servicio del sistema.
  ¿Impacto? Más pasos de configuración inicial, pero mayor flexibilidad:
             debugger de IDE integrado, sin overhead de virtualización.
-->

> **Modo recomendado para:** entornos donde Docker no está disponible,
> máquinas con recursos limitados o cuando se prefiere control total sobre los servicios.

Cada servicio corre directamente en el sistema operativo:

| Servicio   | Cómo corre                         | URL / Puerto          |
| ---------- | ---------------------------------- | --------------------- |
| PostgreSQL | Instalado en el sistema local      | `localhost:5432`      |
| Backend    | `pnpm dev` (tsx watch)             | http://localhost:3000 |
| Frontend   | `pnpm dev` (Vite dev server)       | http://localhost:5173 |
| Mailpit    | Binario standalone (opcional)      | http://localhost:8025 |

---

## Prerrequisitos

Instala las siguientes herramientas antes de comenzar:

| Herramienta    | Versión mínima | Verificar con       | Descargar                                                              |
| -------------- | -------------- | ------------------- | ---------------------------------------------------------------------- |
| **Node.js**    | 20 LTS+        | `node --version`    | https://nodejs.org/                                                    |
| **pnpm**       | 9+             | `pnpm --version`    | `corepack enable && corepack prepare pnpm@latest --activate`           |
| **PostgreSQL** | 17+            | `psql --version`    | https://www.postgresql.org/download/                                   |
| **Git**        | 2.40+          | `git --version`     | https://git-scm.com/downloads                                          |

> ⚠️ **Nunca usar `npm` ni `yarn`** — solo `pnpm` para instalar dependencias de Node.js.

> 🖥️ **Windows**: Usar **Git Bash** como terminal. Los comandos `cp`, `export`
> y rutas con `/` no funcionan en CMD ni PowerShell.

### Instalar pnpm (si no lo tienes)

```bash
# Opción recomendada — vía corepack (incluido con Node.js 16+)
corepack enable
corepack prepare pnpm@latest --activate

# Alternativa — instalación independiente
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

### Instalar PostgreSQL

**Ubuntu / Debian:**

```bash
sudo apt update && sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql   # iniciar automáticamente al arrancar
```

**macOS (Homebrew):**

```bash
brew install postgresql@17
brew services start postgresql@17
```

**Windows:**
Descargar el instalador gráfico desde https://www.postgresql.org/download/windows/
El instalador incluye `psql`, `pgAdmin` y el servicio de Windows.

---

## Paso 1 — Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd proyecto-beex-fe
```

---

## Paso 2 — Preparar PostgreSQL local

Crear el usuario y la base de datos que el backend necesita:

```bash
# Conectarse a PostgreSQL como superusuario
sudo -u postgres psql          # Linux
psql -U postgres               # macOS / Windows (Git Bash)
```

Dentro de la consola de PostgreSQL, ejecutar:

```sql
-- Crear el usuario de la aplicación
CREATE USER nn_user WITH PASSWORD 'nn_password';

-- Crear la base de datos
CREATE DATABASE nn_auth_db OWNER nn_user;

-- Dar todos los privilegios
GRANT ALL PRIVILEGES ON DATABASE nn_auth_db TO nn_user;

-- Salir
\q
```

Verificar la conexión:

```bash
psql -U nn_user -d nn_auth_db -h localhost -c "SELECT version();"
# Deberías ver la versión de PostgreSQL instalada
```

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

Abrir `be/.env` y verificar que los valores son correctos para PostgreSQL local:

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

### 3.3 Ejecutar las migraciones de base de datos

```bash
# Desde be/
pnpm db:migrate
```

Deberías ver algo como:

```
[✓] migrations/0000_initial_schema.sql
```

Verificar que las tablas se crearon:

```bash
psql -U nn_user -d nn_auth_db -h localhost -c "\dt"
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

## Paso 5 — Configurar emails (desarrollo local)

Tienes dos opciones para probar el envío de emails sin Docker:

### Opción A — Sin emails (modo más simple)

Dejar `MAIL_HOST` vacío en `be/.env`:

```bash
MAIL_HOST=
MAIL_PORT=
```

El backend imprimirá el enlace de verificación y recuperación directamente en la
**consola** donde corre `pnpm dev`. Copia el enlace desde la terminal para usarlo.

### Opción B — Mailpit standalone (bandeja visual, recomendado)

Mailpit captura todos los emails en una UI web sin enviarlos a internet.

**Instalar Mailpit:**

```bash
# Linux/macOS — script oficial
curl -sL https://raw.githubusercontent.com/axllent/mailpit/develop/install.sh | bash

# macOS (Homebrew)
brew install mailpit
```

**Iniciar Mailpit** (en una terminal aparte):

```bash
mailpit
# → SMTP escuchando en localhost:1025
# → Web UI en http://localhost:8025
```

**`be/.env` ya está configurado para Mailpit por defecto:**

```bash
MAIL_HOST=localhost
MAIL_PORT=1025
```

Abrir http://localhost:8025 para ver los emails capturados.

---

## Paso 6 — Levantar el sistema (2–3 terminales)

### Terminal 1 — Backend (Express + tsx watch)

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

### Terminal 3 — Mailpit (si usas la Opción B)

```bash
mailpit
```

---

## Paso 7 — Verificar que todo funciona

Abrir en el navegador:

| URL                          | Qué muestra                              |
| ---------------------------- | ---------------------------------------- |
| http://localhost:5173        | Landing page del frontend                |
| http://localhost:3000/health | JSON `{"status":"ok","timestamp":"..."}`  |
| http://localhost:8025        | Mailpit (si está corriendo)              |

Probar el flujo completo:

```bash
# 1. Registrar un usuario
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","fullName":"Test User","password":"Test1234"}'
# → {"success":true,"data":{"id":"...","email":"test@example.com",...}}

# 2. Ver el email de verificación en Mailpit (http://localhost:8025)
#    o copiar el enlace de los logs del backend (Terminal 1)

# 3. Iniciar sesión (solo funciona tras verificar el email)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'
# → {"success":true,"data":{"accessToken":"...","refreshToken":"..."}}
```

---

## Paso 8 — Comandos útiles del día a día

```bash
# ─── Backend (desde be/) ───
pnpm dev             # servidor con hot-reload
pnpm test            # todos los tests (requiere PostgreSQL activo)
pnpm test:watch      # tests en modo watch
pnpm test:coverage   # tests con cobertura
pnpm lint            # verificar errores de ESLint
pnpm format          # formatear con Prettier
pnpm build           # compilar TypeScript → dist/

# ─── Drizzle ORM (desde be/) ───
pnpm db:generate     # generar nuevas migraciones desde schema.ts
pnpm db:migrate      # aplicar migraciones pendientes a la BD
pnpm db:studio       # abrir Drizzle Studio (GUI para la BD) en http://localhost:4983
pnpm db:status       # ver estado de las migraciones aplicadas

# ─── Frontend (desde fe/) ───
pnpm dev             # dev server con hot-reload
pnpm test            # todos los tests (no requiere PostgreSQL)
pnpm test:watch      # tests en modo watch
pnpm test:coverage   # tests con cobertura
pnpm lint            # verificar errores de ESLint
pnpm format          # formatear con Prettier
pnpm build           # compilar para producción → dist/

# ─── PostgreSQL local ───
psql -U nn_user -d nn_auth_db -h localhost   # consola interactiva
```

---

## Paso 9 — Ejecutar tests

### Backend

```bash
cd be

# Todos los tests (PostgreSQL debe estar activo)
pnpm test

# Con cobertura
pnpm test:coverage

# En modo watch (re-ejecuta al guardar)
pnpm test:watch
```

> ⚠️ Los tests del backend usan la misma base de datos PostgreSQL con limpieza
> automática en cada test (`beforeEach` borra los datos). Asegúrate de que
> PostgreSQL esté corriendo antes de ejecutar `pnpm test`.

### Frontend

```bash
cd fe

# Todos los tests (no requiere base de datos ni backend)
pnpm test

# Con cobertura
pnpm test:coverage

# En modo watch
pnpm test:watch
```

---

## Paso 10 — Solución de problemas comunes

### Error "connect ECONNREFUSED 127.0.0.1:5432"

PostgreSQL no está corriendo.

```bash
# Linux
sudo systemctl status postgresql
sudo systemctl start postgresql

# macOS
brew services list | grep postgresql
brew services start postgresql@17
```

### Error al crear el usuario en PostgreSQL: "role already exists"

El usuario ya existe. Puedes recrearlo o usar el existente:

```bash
# Verificar si el usuario existe
sudo -u postgres psql -c "\du"

# Si existe y quieres recrearlo:
sudo -u postgres psql -c "DROP DATABASE IF EXISTS nn_auth_db;"
sudo -u postgres psql -c "DROP USER IF EXISTS nn_user;"
# Luego repetir el Paso 2
```

### Error "port 3000 is already in use"

```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

### Los emails no aparecen en Mailpit

```bash
# Verificar que Mailpit está corriendo
mailpit --version

# Verificar las variables en be/.env
grep MAIL be/.env
# MAIL_HOST=localhost
# MAIL_PORT=1025

# Si MAIL_HOST está vacío, los enlaces aparecen en los logs del backend
# Buscar en la Terminal 1 una línea con /verify-email?token=... o /reset-password?token=...
```

### Error en las migraciones: "relation already exists"

```bash
# Ver estado actual
cd be && pnpm db:status

# Si quieres reiniciar la BD desde cero:
sudo -u postgres psql -c "DROP DATABASE nn_auth_db;"
sudo -u postgres psql -c "CREATE DATABASE nn_auth_db OWNER nn_user;"
pnpm db:migrate
```

---

## Resumen rápido

```bash
# Setup inicial (una sola vez)
git clone <url> && cd proyecto-beex-fe

# Base de datos
sudo -u postgres psql -c "CREATE USER nn_user WITH PASSWORD 'nn_password';"
sudo -u postgres psql -c "CREATE DATABASE nn_auth_db OWNER nn_user;"

# Backend
cd be && pnpm install && cp .env.example .env && pnpm db:migrate

# Frontend
cd ../fe && pnpm install && cp .env.example .env

# Levantar (terminales separadas)
cd be && pnpm dev          # Terminal 1 → http://localhost:3000
cd fe && pnpm dev          # Terminal 2 → http://localhost:5173
mailpit                    # Terminal 3 → http://localhost:8025 (opcional)

# Verificar
curl http://localhost:3000/health
# Abrir http://localhost:5173
```
