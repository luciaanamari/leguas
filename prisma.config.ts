import { defineConfig } from '@prisma/config'
import { config } from 'dotenv'

// Prisma 7 com config file NÃO carrega .env automaticamente.
// O projeto usa .env.local (convenção do Next); carregamos manualmente,
// com fallback para .env. Variáveis já presentes no ambiente têm prioridade
// (ex.: DATABASE_URL injetada pelo docker-compose no container).
config({ path: '.env.local' })
config({ path: '.env' })

export default defineConfig({
  migrations: {
    seed: 'tsx ./prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
