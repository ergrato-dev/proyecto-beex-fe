# Restricciones del Proyecto — NN Auth System (Express Edition)

## RT-001 — Stack Tecnológico Fijo

El stack tecnológico está definido y no puede modificarse sin aprobación explícita del instructor:

- **Backend**: Node.js 20 LTS + Express.js 5 + TypeScript 5
- **Frontend**: React 18 + Vite 6 + TypeScript 5 + TailwindCSS 4
- **Base de datos**: PostgreSQL 17
- **ORM**: Drizzle ORM + drizzle-kit
- **Gestión de paquetes**: `pnpm` exclusivamente — `npm` y `yarn` están prohibidos

## RT-002 — Idioma del Código

- **Código** (variables, funciones, clases, endpoints, columnas de BD): **inglés**
- **Comentarios, documentación, commits**: **español** (salvo los campos del formato de commit: What/For/Impact en inglés)

## RT-003 — Seguridad No Negociable

Las siguientes restricciones de seguridad son absolutas:

- Nunca almacenar contraseñas en texto plano
- Nunca exponer `hashed_password` en responses HTTP
- Nunca hardcodear secrets, claves JWT o credenciales de BD en el código
- Nunca usar `cors({ origin: '*' })` en producción

## RT-004 — Calidad Mínima

- Cobertura de tests: mínimo **80%** en módulos de lógica de negocio
- Sin errores de ESLint ni TypeScript antes de hacer commit
- Cada feature debe tener tests antes de considerarse completa

## RT-005 — Commits

- Formato **Conventional Commits** obligatorio en todos los commits
- Incluir siempre los campos `What:`, `For:`, `Impact:` en el cuerpo del commit

## RT-006 — Variables de Entorno

- El archivo `.env` no debe versionarse (incluido en `.gitignore`)
- El archivo `.env.example` siempre debe estar actualizado con todas las variables necesarias
- Las variables de entorno del backend deben validarse con zod al iniciar la aplicación

## RT-007 — Compatibilidad Docker

El proyecto debe poder levantarse con y sin Docker:
- **Con Docker**: `docker compose up -d` levanta PostgreSQL + Mailpit
- **Sin Docker**: PostgreSQL local con las credenciales del `.env.example`

## RT-008 — Propósito Educativo

- Todo código generado o escrito debe incluir comentarios pedagógicos (¿Qué? ¿Para qué? ¿Impacto?)
- La cabecera de archivo es obligatoria en cada archivo nuevo
- No se prioriza la optimización prematura sobre la legibilidad
