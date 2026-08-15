# Restricciones del Proyecto — NN Auth System (Express Edition)

<!--
  ¿Qué? Restricciones globales que gobiernan todo el proyecto.
  ¿Para qué? Definir límites claros de tecnología, diseño, seguridad y organización que no son negociables.
  ¿Impacto? Cualquier decisión técnica o de diseño debe verificarse contra estas restricciones antes de implementarse.
-->

---

## 1. Restricciones Tecnológicas

### RT-001 — Stack Tecnológico Fijo

El stack tecnológico está definido y **no puede modificarse** sin aprobación explícita del instructor:

| Capa            | Tecnología                                          |
| --------------- | --------------------------------------------------- |
| Runtime         | Node.js 20 LTS                                      |
| Framework BE    | Express.js 5 + TypeScript 5                         |
| Framework FE    | React 18 + Vite 6 + TypeScript 5 + TailwindCSS 4   |
| Base de datos   | PostgreSQL 17                                       |
| ORM             | Prisma ORM + Prisma Migrate                         |
| Validación      | Zod (BE) — exclusivamente                           |
| Auth            | JWT (jsonwebtoken) — access 15 min + refresh 7 días |
| Hashing         | bcryptjs (salt rounds = 12)                         |
| Email (dev)     | Nodemailer + Mailpit                                |
| i18n            | i18next + react-i18next                             |

### RT-002 — Gestión de Paquetes

- **`pnpm` exclusivamente** — `npm` y `yarn` están **prohibidos**
- Versiones de dependencias **siempre exactas** (`"vite": "8.0.3"`) — jamás rangos `^`, `~`, `>=`, `*` ni `latest`
- El archivo `.npmrc` de cada workspace debe tener `save-exact=true`
- Toda dependencia nueva debe auditarse en `security.snyk.io` antes de instalarse

### RT-003 — Idiomas Soportados (i18n)

- Solo se soportan los locales `"es"` (Español) y `"en"` (English)
- El idioma predeterminado es `"es"`
- El campo `locale` en la BD debe ser uno de esos dos valores — validado con Zod en el servidor

---

## 2. Restricciones de Herramientas y Entorno

### RH-001 — Linter y Formateador

- **ESLint** y **Prettier** son obligatorios en BE y FE
- El código debe pasar `pnpm lint` sin errores antes de cada commit
- La configuración de ESLint no puede desactivar reglas de TypeScript strict

### RH-002 — Control de Versiones

- Ramas: solo `main` (estable) y `dev` (desarrollo activo)
- **NUNCA** hacer commits directamente en `main`
- **NUNCA** usar `git push --force`
- Los merges a `main` solo se hacen cuando `pnpm test` pasa en `dev`

### RH-003 — Entorno de Desarrollo

- PostgreSQL 17 y Mailpit deben levantarse con `docker compose up -d` en desarrollo
- También es válida la instalación directa de PostgreSQL 17 sin Docker
- Para captura de emails en dev: Mailpit en `localhost:8025`

---

## 3. Restricciones de Diseño Visual

### RD-001 — Sin Degradados

- **Prohibido** el uso de `bg-gradient-*`, `from-*`, `via-*`, `to-*` en ningún componente
- Los colores deben ser sólidos y planos

### RD-002 — Tipografía Sans-Serif Exclusivamente

- Solo fuentes `sans-serif` — **prohibidas** las fuentes `serif` y `monospace` en UI general
- Fuentes recomendadas: `Inter`, `system-ui`, `sans-serif`

### RD-003 — Alineación de Botones de Acción

- Los botones de acción (Guardar, Enviar, Continuar) deben estar **alineados a la derecha** (`justify-end`)
- Los botones de cancelación/regresar pueden ubicarse a la izquierda o junto al botón primario

### RD-004 — Librería de Íconos

- Solo se permite `lucide-react` para íconos en el frontend
- **Prohibido** usar `react-icons`, Font Awesome, Material Icons u otras librerías de íconos

### RD-005 — Dark / Light Mode

- La interfaz debe soportar ambos modos: dark y light
- El toggle debe ser visible en la Navbar en todas las páginas
- Usar `prefers-color-scheme` como valor inicial si no hay preferencia guardada

---

## 4. Restricciones de Idioma

### RI-001 — Código en Inglés

Todo lo que sea código debe estar en inglés:
- Variables, funciones, clases, métodos
- Nombres de archivos y carpetas de código
- Endpoints y rutas de la API
- Nombres de tablas y columnas en la base de datos
- Nombres de componentes React
- Mensajes de commits

### RI-002 — Documentación y Comentarios en Español

Todo lo que sea documentación debe estar en español:
- Comentarios en el código (`//`, `/* */`, JSDoc)
- Archivos de documentación (`.md`)
- README.md
- Mensajes de error visibles al usuario en la UI

**Excepción**: Los campos del cuerpo del commit (`What:`, `For:`, `Impact:`) van en inglés por convención de Conventional Commits.

---

## 5. Restricciones Organizacionales

### RO-001 — Propósito Educativo

- Todo código generado o escrito **debe** incluir comentarios pedagógicos (¿Qué? / ¿Para qué? / ¿Impacto?)
- La cabecera de archivo es **obligatoria** en cada archivo nuevo
- No se prioriza la optimización prematura sobre la legibilidad del código

### RO-002 — Calidad Mínima No Negociable

- Cobertura de tests: mínimo **80%** en módulos de lógica de negocio
- Sin errores de ESLint ni TypeScript antes de hacer commit
- Cada feature debe tener sus tests antes de considerarse completa

### RO-003 — Formato de Commits

- Formato **Conventional Commits** obligatorio en todos los commits
- Incluir siempre los campos `For:` e `Impact:` en el cuerpo del commit
- Tipos permitidos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `perf`

### RO-004 — Variables de Entorno

- El archivo `.env` **no debe versionarse** (incluido en `.gitignore`)
- El archivo `.env.example` **siempre** debe estar actualizado con todas las variables necesarias
- Las variables de entorno del backend deben validarse con Zod al iniciar la aplicación
- **Prohibido** hardcodear: passwords, secrets JWT, credenciales de BD, URLs de servicios externos

---

## 6. Restricciones de Seguridad

### RS-001 — Contraseñas

- Nunca almacenar contraseñas en texto plano
- Nunca exponer `hashed_password` en responses HTTP
- Nunca loggear contraseñas (ni siquiera parcialmente)

### RS-002 — Secrets y Credenciales

- Nunca hardcodear secrets, claves JWT o credenciales de BD en el código fuente
- Los secrets JWT deben tener mínimo 32 caracteres aleatorios
- Usar variables de entorno exclusivamente para toda configuración sensible

### RS-003 — CORS y Headers

- Nunca usar `cors({ origin: '*' })` en producción
- Orígenes CORS deben ser explícitos y provenir de variables de entorno
- Usar `helmet` para configurar automáticamente los headers de seguridad HTTP

### RS-004 — Auditoría de Dependencias

- Antes de instalar cualquier paquete: auditar en `security.snyk.io`
- Verificar que la versión específica no tenga CVEs conocidos
- Documentar en el commit qué se verificó y en qué fuente
