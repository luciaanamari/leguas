-- Ciclo 1 M0: Organização, Escola, RBAC estendido, PerfilEstudante, SolicitacaoRedefinicaoSenha

-- CreateEnum
CREATE TYPE "Sexo" AS ENUM ('FEMININO', 'MASCULINO', 'NAO_INFORMADO');

-- CreateEnum
CREATE TYPE "StatusSolicitacaoSenha" AS ENUM ('PENDENTE', 'ATENDIDA', 'CANCELADA');

-- AlterEnum
ALTER TYPE "AdminRole" ADD VALUE 'ORG_ADMIN';
ALTER TYPE "AdminRole" ADD VALUE 'ESCOLA_ADMIN';

-- CreateTable
CREATE TABLE "Organizacao" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "cnpj" TEXT,
    "contato" TEXT,
    "logoUrl" TEXT,
    "corBackground" TEXT,
    "corSurface" TEXT,
    "corAccent" TEXT,
    "corText" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organizacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Escola" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "inep" TEXT,
    "municipio" TEXT,
    "organizacaoId" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Escola_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerfilEstudante" (
    "id" TEXT NOT NULL,
    "estudanteId" TEXT NOT NULL,
    "areaQuizH" INTEGER NOT NULL,
    "areaQuizE" INTEGER NOT NULL,
    "areaQuizB" INTEGER NOT NULL,
    "discPerfil" "DiscPerfil" NOT NULL,
    "respostasDisc" JSONB NOT NULL,
    "vigente" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PerfilEstudante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitacaoRedefinicaoSenha" (
    "id" TEXT NOT NULL,
    "estudanteId" TEXT NOT NULL,
    "status" "StatusSolicitacaoSenha" NOT NULL DEFAULT 'PENDENTE',
    "atendidaPorAdminId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atendidaEm" TIMESTAMP(3),

    CONSTRAINT "SolicitacaoRedefinicaoSenha_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN "organizacaoId" TEXT,
ADD COLUMN "escolaId" TEXT;

-- AlterTable
ALTER TABLE "Estudante" ADD COLUMN "sexo" "Sexo" NOT NULL DEFAULT 'NAO_INFORMADO',
ADD COLUMN "escolaId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Organizacao_slug_key" ON "Organizacao"("slug");

-- CreateIndex
CREATE INDEX "Escola_organizacaoId_idx" ON "Escola"("organizacaoId");

-- CreateIndex
CREATE INDEX "Admin_organizacaoId_idx" ON "Admin"("organizacaoId");

-- CreateIndex
CREATE INDEX "Admin_escolaId_idx" ON "Admin"("escolaId");

-- CreateIndex
CREATE INDEX "Estudante_escolaId_idx" ON "Estudante"("escolaId");

-- CreateIndex
CREATE INDEX "PerfilEstudante_estudanteId_idx" ON "PerfilEstudante"("estudanteId");

-- CreateIndex
CREATE INDEX "SolicitacaoRedefinicaoSenha_estudanteId_idx" ON "SolicitacaoRedefinicaoSenha"("estudanteId");

-- CreateIndex
CREATE INDEX "SolicitacaoRedefinicaoSenha_status_idx" ON "SolicitacaoRedefinicaoSenha"("status");

-- AddForeignKey
ALTER TABLE "Escola" ADD CONSTRAINT "Escola_organizacaoId_fkey" FOREIGN KEY ("organizacaoId") REFERENCES "Organizacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_organizacaoId_fkey" FOREIGN KEY ("organizacaoId") REFERENCES "Organizacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "Escola"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estudante" ADD CONSTRAINT "Estudante_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "Escola"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerfilEstudante" ADD CONSTRAINT "PerfilEstudante_estudanteId_fkey" FOREIGN KEY ("estudanteId") REFERENCES "Estudante"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoRedefinicaoSenha" ADD CONSTRAINT "SolicitacaoRedefinicaoSenha_estudanteId_fkey" FOREIGN KEY ("estudanteId") REFERENCES "Estudante"("id") ON DELETE CASCADE ON UPDATE CASCADE;
