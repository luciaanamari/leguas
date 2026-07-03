-- CPF passa a ser opcional (cpfHash pode ser nulo; o índice único permite
-- múltiplos NULLs no Postgres) e nova coluna matrícula no Estudante.

-- AlterTable
ALTER TABLE "Estudante" ALTER COLUMN "cpfHash" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Estudante" ADD COLUMN "matricula" TEXT;
