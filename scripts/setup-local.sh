#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

echo "=================================================="
echo " Agendou - Preparação Rápida para Testes Locais"
echo "=================================================="

# 1. Garante arquivo .env configurado para o banco local de testes
if [ ! -f "${ROOT_DIR}/.env" ]; then
  if [ -f "${ROOT_DIR}/.env.example" ]; then
    echo "-> Criando .env a partir de .env.example..."
    cp "${ROOT_DIR}/.env.example" "${ROOT_DIR}/.env"
  else
    cat << 'EOF' > "${ROOT_DIR}/.env"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/agendou_test?schema=public"
AUTH_SECRET="agendou-super-secret-key-change-in-production"
COOKIE_SECURE="false"
EOF
  fi
fi

# 2. Garante dependências instaladas e Prisma Client gerado
if [ ! -d "${ROOT_DIR}/node_modules" ] || [ ! -d "${ROOT_DIR}/node_modules/@prisma/client" ]; then
  echo "-> Dependências ausentes. Executando scripts/install-deps.sh..."
  bash "${ROOT_DIR}/scripts/install-deps.sh"
else
  echo "-> Dependências já instaladas. Garantindo Prisma Client atualizado..."
  npx prisma generate >/dev/null
fi

# 3. Inicia o cluster PostgreSQL local de testes (porta 5432, database agendou_test)
echo "-> Iniciando banco de dados PostgreSQL local de testes..."
bash "${ROOT_DIR}/scripts/test-db.sh" start

# 4. Aplica as migrações versionadas (db/migrations) no banco de testes
echo "-> Aplicando migrações do Prisma (migrate deploy)..."
if ! SAIDA_MIGRATE="$(npx prisma migrate deploy 2>&1)"; then
  if echo "${SAIDA_MIGRATE}" | grep -q "P3005"; then
    # Banco criado antes das migrações (com db push): as tabelas já seguem o
    # esquema, então a migração inicial é só marcada como aplicada.
    echo "-> Banco criado antes das migrações. Registrando a migração inicial como aplicada..."
    npx prisma migrate resolve --applied 20261117120000_init
    npx prisma migrate deploy
  else
    echo "${SAIDA_MIGRATE}"
    exit 1
  fi
else
  echo "${SAIDA_MIGRATE}"
fi

# 5. Popula o banco com dados de teste (cliente, comércios, serviços e horários)
echo "-> Populando dados iniciais de teste (seed)..."
node --env-file=.env "${ROOT_DIR}/db/seed.mjs"

echo ""
echo "=================================================="
echo " Ambiente local 100% pronto para uso!"
echo "=================================================="
echo " Contas de teste disponíveis (Senha: Teste1234):"
echo "   - Cliente:   cliente@teste.com"
echo "   - Comércio:  barbearia@teste.com"
echo "   - Comércio:  estetica@teste.com"
echo ""
echo " Agora basta executar:"
echo "   npm run dev"
echo "=================================================="
