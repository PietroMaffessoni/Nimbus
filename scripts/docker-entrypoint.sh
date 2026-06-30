#!/bin/sh
set -e

echo "Aguardando banco de dados aceitar conexões..."
attempt=0
until npx prisma migrate deploy; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 15 ]; then
    echo "Não foi possível aplicar as migrations após várias tentativas."
    exit 1
  fi
  echo "Banco ainda não está pronto, tentando novamente em 2s... ($attempt/15)"
  sleep 2
done

echo "Migrations aplicadas com sucesso."

echo "Verificando se é necessário popular dados de demonstração..."
npx tsx prisma/seed.ts || echo "Seed ignorado ou já executado anteriormente."

echo "Iniciando aplicação Next.js..."
exec npm run start
