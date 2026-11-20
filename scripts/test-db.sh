#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PGDATA_DIR="${ROOT_DIR}/.pgdata-test"
LOG_FILE="${PGDATA_DIR}/postgres.log"
PG_PORT=5432
PG_USER="postgres"
DB_NAME="agendou_test"

ACTION="${1:-start}"

init_cluster_if_needed() {
  if [ ! -f "${PGDATA_DIR}/PG_VERSION" ]; then
    echo "-> Inicializando cluster PostgreSQL de testes em ${PGDATA_DIR}..."
    mkdir -p "${PGDATA_DIR}"
    initdb -D "${PGDATA_DIR}" -U "${PG_USER}" --auth=trust --no-locale --encoding=UTF8 >/dev/null
  fi
}

start_db() {
  init_cluster_if_needed

  if pg_ctl -D "${PGDATA_DIR}" status >/dev/null 2>&1; then
    echo "-> Banco PostgreSQL de testes já está em execução na porta ${PG_PORT}."
  else
    echo "-> Iniciando PostgreSQL de testes na porta ${PG_PORT}..."
    pg_ctl -D "${PGDATA_DIR}" -l "${LOG_FILE}" -o "-p ${PG_PORT} -k /tmp" start >/dev/null
  fi

  local exists
  exists="$(psql -h localhost -p "${PG_PORT}" -U "${PG_USER}" -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'")"
  if [ "${exists}" != "1" ]; then
    echo "-> Criando database '${DB_NAME}'..."
    psql -h localhost -p "${PG_PORT}" -U "${PG_USER}" -c "CREATE DATABASE ${DB_NAME};" >/dev/null
  fi

  echo "-> Banco de testes '${DB_NAME}' pronto em postgresql://${PG_USER}:${PG_USER}@localhost:${PG_PORT}/${DB_NAME}?schema=public"
}

stop_db() {
  if [ -d "${PGDATA_DIR}" ] && pg_ctl -D "${PGDATA_DIR}" status >/dev/null 2>&1; then
    echo "-> Parando PostgreSQL de testes..."
    pg_ctl -D "${PGDATA_DIR}" stop >/dev/null
    echo "-> Banco de testes parado."
  else
    echo "-> Banco de testes não está em execução."
  fi
}

status_db() {
  if [ -d "${PGDATA_DIR}" ]; then
    pg_ctl -D "${PGDATA_DIR}" status
  else
    echo "Cluster de testes ainda não foi inicializado."
  fi
}

reset_db() {
  start_db
  echo "-> Recriando database '${DB_NAME}' para testes limpos..."
  psql -h localhost -p "${PG_PORT}" -U "${PG_USER}" -c "DROP DATABASE IF EXISTS ${DB_NAME} WITH (FORCE);" >/dev/null
  psql -h localhost -p "${PG_PORT}" -U "${PG_USER}" -c "CREATE DATABASE ${DB_NAME};" >/dev/null
  npx prisma migrate deploy
  node --env-file=.env db/seed.mjs
}

case "${ACTION}" in
  start)
    start_db
    ;;
  stop)
    stop_db
    ;;
  status)
    status_db
    ;;
  reset)
    reset_db
    ;;
  *)
    echo "Uso: $0 {start|stop|status|reset}"
    exit 1
    ;;
esac

