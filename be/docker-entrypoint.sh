#!/usr/bin/env sh
# ¿Qué? Entrypoint del contenedor backend.
# ¿Para qué? Aplicar las migraciones de Prisma pendientes antes de arrancar el servidor.
# ¿Impacto? Sin esto, un contenedor nuevo arrancaría contra una BD sin las tablas creadas.
set -e

echo "→ Aplicando migraciones de Prisma..."
pnpm prisma migrate deploy

echo "→ Iniciando servidor..."
exec node dist/index.js
