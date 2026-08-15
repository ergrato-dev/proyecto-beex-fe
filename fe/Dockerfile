# Archivo: fe/Dockerfile
# ¿Qué? Build multi-stage del frontend React/Vite sobre node:22-alpine, servido por nginx.
# ¿Para qué? Compilar los assets estáticos en `builder` y servirlos con un servidor HTTP
#   liviano en runtime — sin Node.js ni dependencias de desarrollo en la imagen final.
# ¿Impacto? La imagen final pesa ~30MB (nginx:alpine) en vez de cientos de MB con Node.

# ---- Etapa 1: builder ----
FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.20.0 --activate

# ¿Qué? URL de la API embebida en el build — Vite la inyecta en tiempo de compilación.
# ¿Para qué? El bundle estático no puede leer variables de entorno en runtime.
ARG VITE_API_BASE_URL=http://localhost:3000/api/v1
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# ---- Etapa 2: runtime ----
FROM nginx:1.28.3-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
