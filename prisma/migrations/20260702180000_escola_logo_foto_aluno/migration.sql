-- Storage de objetos: logo da escola e foto de perfil do aluno.

-- AlterTable
ALTER TABLE "Escola" ADD COLUMN "logoUrl" TEXT;

-- AlterTable
ALTER TABLE "Estudante" ADD COLUMN "fotoPerfilKey" TEXT;
