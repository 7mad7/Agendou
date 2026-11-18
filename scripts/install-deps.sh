#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

echo "=================================================="
echo " Agendou - Instalação de Dependências do Projeto"
echo "=================================================="

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "Erro: Node.js e npm precisam estar instalados no ambiente."
  exit 1
fi

echo "-> Node.js: $(node -v) | npm: $(npm -v)"

if [ ! -f "${ROOT_DIR}/.env" ] && [ -f "${ROOT_DIR}/.env.example" ]; then
  echo "-> Criando arquivo .env a partir de .env.example..."
  cp "${ROOT_DIR}/.env.example" "${ROOT_DIR}/.env"
fi

echo "-> Instalando pacotes npm (dependencies & devDependencies)..."
npm install

echo "-> Gerando cliente tipado do Prisma (@prisma/client)..."
npx prisma generate

echo "=================================================="
echo " Dependências instaladas e Prisma Client gerado!"
echo "=================================================="
