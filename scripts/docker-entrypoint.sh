#!/bin/sh
set -e

echo "[entrypoint] Aguardando banco em $DATABASE_URL..."
sleep 1

echo "[entrypoint] Gerando Prisma Client..."
npx prisma generate

# Aplica migrations se existirem, senao sincroniza schema do zero
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  echo "[entrypoint] Aplicando migrations existentes..."
  npx prisma migrate deploy
else
  echo "[entrypoint] Nenhuma migration encontrada. Sincronizando schema com db push..."
  npx prisma db push --accept-data-loss
fi

# Seed apenas se nao houver nenhum admin cadastrado (primeira inicializacao)
echo "[entrypoint] Verificando se seed ja foi executado..."
ADMIN_COUNT=$(node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.admin.count()
  .then(n => { process.stdout.write(String(n)); return prisma.\$disconnect(); })
  .catch(() => { process.stdout.write('0'); });
" 2>/dev/null || echo "0")

if [ "$ADMIN_COUNT" = "0" ]; then
  echo "[entrypoint] Primeira inicializacao detectada. Rodando seed..."
  npx tsx prisma/seed.ts
else
  echo "[entrypoint] Banco ja populado ($ADMIN_COUNT admin(s) encontrado(s)). Seed ignorado."
fi

echo "[entrypoint] Iniciando aplicacao..."
exec "$@"
