-- Ciclo 1 (revisão): cadastro por link institucional — modelo LinkCadastro

-- CreateTable
CREATE TABLE "LinkCadastro" (
    "id" TEXT NOT NULL,
    "escolaId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "rotulo" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "permanente" BOOLEAN NOT NULL DEFAULT false,
    "codigoConvite" TEXT,
    "expiraEm" TIMESTAMP(3),
    "totalCadastros" INTEGER NOT NULL DEFAULT 0,
    "criadoPorAdminId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkCadastro_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LinkCadastro_slug_key" ON "LinkCadastro"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "LinkCadastro_codigoConvite_key" ON "LinkCadastro"("codigoConvite");

-- CreateIndex
CREATE INDEX "LinkCadastro_escolaId_idx" ON "LinkCadastro"("escolaId");

-- CreateIndex
CREATE INDEX "LinkCadastro_ativo_idx" ON "LinkCadastro"("ativo");

-- AddForeignKey
ALTER TABLE "LinkCadastro" ADD CONSTRAINT "LinkCadastro_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "Escola"("id") ON DELETE CASCADE ON UPDATE CASCADE;
