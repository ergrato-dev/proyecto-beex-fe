# Archivo: be/Dockerfile
# ¿Qué? Build multi-stage del backend Express/TypeScript sobre node:22-alpine.
# ¿Para qué? Compilar con todas las devDependencies en `builder`, pero servir un runtime
#   liviano que solo instala dependencias de producción.
# ¿Impacto? Sin multi-stage, la imagen final arrastraría TypeScript, ESLint, etc. — más
#   peso y más superficie de ataque de la necesaria en producción.

# ---- Etapa 1: builder ----
FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.20.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY prisma.config.ts ./
COPY prisma ./prisma
# ¿Qué? DATABASE_URL placeholder solo para satisfacer prisma.config.ts durante `generate`.
# ¿Para qué? `generate` no se conecta a la BD — solo lee el schema — pero Prisma 7 exige que
#   la variable exista. El valor real llega en runtime vía docker-compose.yml/.env.
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN pnpm prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN pnpm build

# ---- Etapa 2: runtime ----
FROM node:22-alpine AS runtime

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.20.0 --activate

ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY prisma.config.ts ./
COPY prisma ./prisma
# ¿Qué? Regenerar el Prisma Client en la etapa runtime.
# ¿Para qué? El client generado en `builder` vive en un node_modules distinto (dev+prod);
#   regenerarlo aquí es más simple y confiable que copiar rutas del store virtual de pnpm.
# ¿Por qué el DATABASE_URL placeholder? Igual que en `builder` — `generate` no se conecta a
#   la BD, pero Prisma 7 exige que la variable exista para cargar prisma.config.ts.
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN pnpm prisma generate

COPY --from=builder /app/dist ./dist
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# ¿Qué? Correr como usuario no-root (imagen node:alpine trae el usuario `node` por defecto).
# ¿Para qué? Reducir el impacto si un atacante logra ejecutar código en el contenedor.
USER node

EXPOSE 3000

CMD ["./docker-entrypoint.sh"]
