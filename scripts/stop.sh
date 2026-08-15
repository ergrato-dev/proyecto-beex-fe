#!/usr/bin/env bash
# ¿Qué? Detiene todos los servicios del stack NN Auth (Express Edition).
# ¿Para qué? Complemento simétrico de start.sh — un único comando para apagar todo.
# ¿Impacto? No borra volúmenes (los datos de PostgreSQL persisten) salvo que se pase -v.
#
# Uso:
#   ./scripts/stop.sh       # detiene y elimina los contenedores, conserva datos
#   ./scripts/stop.sh -v    # además elimina el volumen de datos de PostgreSQL

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_ROOT}"

if [[ "${1:-}" == "-v" ]]; then
  echo "Deteniendo servicios y eliminando el volumen de datos de PostgreSQL..."
  docker compose down -v
else
  echo "Deteniendo servicios (los datos de PostgreSQL se conservan)..."
  docker compose down
fi

echo "Listo. Para volver a levantar todo: ./scripts/start.sh"
