import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  // eslint-disable-next-line no-var
  var prismaClient: PrismaClient | undefined;
}

// Função auxiliar para inicializar o pool do PostgreSQL e o adaptador do Prisma 7
const inicializarPrisma = () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
};

// Reutiliza a instância global se existir, caso contrário cria uma nova
export const prisma = globalThis.prismaClient ?? inicializarPrisma();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaClient = prisma;
}