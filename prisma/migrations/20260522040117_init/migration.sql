-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'EDITOR');

-- CreateEnum
CREATE TYPE "Preocupacao" AS ENUM ('SEM_DINHEIRO_FACULDADE', 'PRECISO_TRABALHAR_LOGO', 'NAO_PASSAR_NO_ENEM', 'MEDO_ESCOLHER_ERRADO', 'NAO_CONHECO_OPCOES');

-- CreateEnum
CREATE TYPE "AnoEscolar" AS ENUM ('PRIMEIRO', 'SEGUNDO', 'TERCEIRO');

-- CreateEnum
CREATE TYPE "ModalidadeTrilha" AS ENUM ('PRESENCIAL', 'EAD', 'TECNICO', 'CONCURSO', 'MERCADO');

-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('SESSAO_INICIADA', 'TRILHA_VISUALIZADA', 'SIMULACAO_INICIADA', 'SIMULACAO_CONCLUIDA', 'RESULTADO_VISUALIZADO', 'RESULTADO_COMPARTILHADO', 'LOGIN', 'LOGOUT');

-- CreateEnum
CREATE TYPE "RendaFamiliar" AS ENUM ('ATE_1K', 'DE_1K_A_2_5K', 'DE_2_5K_A_5K', 'ACIMA_5K', 'PREFIRO_NAO_INFORMAR');

-- CreateEnum
CREATE TYPE "PerfilEmpreendedor" AS ENUM ('ESTAVEL', 'EQUILIBRIO', 'EMPREENDEDOR', 'ALTO_RISCO');

-- CreateEnum
CREATE TYPE "DiscPerfil" AS ENUM ('D', 'I', 'S', 'C');

-- CreateEnum
CREATE TYPE "AreaDISC" AS ENUM ('HUMANAS', 'EXATAS', 'BIOLOGICAS');

-- CreateEnum
CREATE TYPE "FaixaResultado" AS ENUM ('ALTA', 'MEDIA', 'BAIXA');

-- CreateTable
CREATE TABLE "Estudante" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "senhaHash" TEXT,
    "dataNascimento" TIMESTAMP(3) NOT NULL,
    "cpfHash" TEXT NOT NULL,
    "whatsappHash" TEXT,
    "rendaFamiliar" "RendaFamiliar" NOT NULL,
    "escolaNome" TEXT NOT NULL,
    "escolaAno" "AnoEscolar" NOT NULL,
    "cursoTecnico" TEXT,
    "perfilEmpreendedor" "PerfilEmpreendedor" NOT NULL,
    "preocupacoes" "Preocupacao"[],
    "areaQuizH" INTEGER NOT NULL DEFAULT 0,
    "areaQuizE" INTEGER NOT NULL DEFAULT 0,
    "areaQuizB" INTEGER NOT NULL DEFAULT 0,
    "discPerfil" "DiscPerfil" NOT NULL,
    "respostasDisc" JSONB NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "tokenSenhaHash" TEXT,
    "tokenSenhaExpiraEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Estudante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'EDITOR',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trilha" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "modalidade" "ModalidadeTrilha" NOT NULL,
    "descricaoCurta" TEXT NOT NULL,
    "descricaoCompleta" TEXT NOT NULL,
    "comoEntrar" TEXT NOT NULL,
    "duracao" TEXT NOT NULL,
    "custoEstimado" TEXT NOT NULL,
    "primeirosPassos" TEXT NOT NULL,
    "narrativaAluno" TEXT,
    "narrativaProfissional" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trilha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profissao" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "trilhaId" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Profissao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Simulacao" (
    "id" TEXT NOT NULL,
    "estudanteId" TEXT NOT NULL,
    "trilhaId" TEXT NOT NULL,
    "areaSlug" TEXT NOT NULL,
    "cursoSlug" TEXT NOT NULL,
    "narrativaAluno" TEXT NOT NULL,
    "narrativaProfissional" TEXT NOT NULL,
    "respostasAfinidade" JSONB,
    "iniciadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "concluidaEm" TIMESTAMP(3),

    CONSTRAINT "Simulacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResultadoMatch" (
    "id" TEXT NOT NULL,
    "estudanteId" TEXT NOT NULL,
    "trilhaId" TEXT NOT NULL,
    "simulacaoId" TEXT NOT NULL,
    "pontuacao" INTEGER NOT NULL,
    "pontuacaoArea" INTEGER NOT NULL,
    "pontuacaoCurso" INTEGER NOT NULL,
    "faixa" "FaixaResultado" NOT NULL,
    "tituloDisc" TEXT NOT NULL,
    "areaDominante" "AreaDISC" NOT NULL,
    "cursoSlug" TEXT NOT NULL,
    "justificativa" TEXT NOT NULL,
    "proximoPasso" TEXT NOT NULL,
    "contextoBlocos" JSONB NOT NULL,
    "explicacao" JSONB NOT NULL,
    "compartilhado" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResultadoMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoEngajamento" (
    "id" TEXT NOT NULL,
    "estudanteId" TEXT,
    "tipoEvento" "TipoEvento" NOT NULL,
    "payload" JSONB,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventoEngajamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Estudante_email_key" ON "Estudante"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Estudante_cpfHash_key" ON "Estudante"("cpfHash");

-- CreateIndex
CREATE INDEX "Estudante_escolaNome_idx" ON "Estudante"("escolaNome");

-- CreateIndex
CREATE INDEX "Estudante_criadoEm_idx" ON "Estudante"("criadoEm");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Trilha_slug_key" ON "Trilha"("slug");

-- CreateIndex
CREATE INDEX "Trilha_ativo_ordem_idx" ON "Trilha"("ativo", "ordem");

-- CreateIndex
CREATE INDEX "Profissao_trilhaId_idx" ON "Profissao"("trilhaId");

-- CreateIndex
CREATE INDEX "Simulacao_estudanteId_idx" ON "Simulacao"("estudanteId");

-- CreateIndex
CREATE INDEX "Simulacao_trilhaId_idx" ON "Simulacao"("trilhaId");

-- CreateIndex
CREATE INDEX "Simulacao_cursoSlug_idx" ON "Simulacao"("cursoSlug");

-- CreateIndex
CREATE UNIQUE INDEX "ResultadoMatch_simulacaoId_key" ON "ResultadoMatch"("simulacaoId");

-- CreateIndex
CREATE INDEX "ResultadoMatch_estudanteId_idx" ON "ResultadoMatch"("estudanteId");

-- CreateIndex
CREATE INDEX "ResultadoMatch_trilhaId_idx" ON "ResultadoMatch"("trilhaId");

-- CreateIndex
CREATE INDEX "EventoEngajamento_tipoEvento_criadoEm_idx" ON "EventoEngajamento"("tipoEvento", "criadoEm");

-- CreateIndex
CREATE INDEX "EventoEngajamento_estudanteId_idx" ON "EventoEngajamento"("estudanteId");

-- AddForeignKey
ALTER TABLE "Profissao" ADD CONSTRAINT "Profissao_trilhaId_fkey" FOREIGN KEY ("trilhaId") REFERENCES "Trilha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Simulacao" ADD CONSTRAINT "Simulacao_estudanteId_fkey" FOREIGN KEY ("estudanteId") REFERENCES "Estudante"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Simulacao" ADD CONSTRAINT "Simulacao_trilhaId_fkey" FOREIGN KEY ("trilhaId") REFERENCES "Trilha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultadoMatch" ADD CONSTRAINT "ResultadoMatch_estudanteId_fkey" FOREIGN KEY ("estudanteId") REFERENCES "Estudante"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultadoMatch" ADD CONSTRAINT "ResultadoMatch_trilhaId_fkey" FOREIGN KEY ("trilhaId") REFERENCES "Trilha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultadoMatch" ADD CONSTRAINT "ResultadoMatch_simulacaoId_fkey" FOREIGN KEY ("simulacaoId") REFERENCES "Simulacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoEngajamento" ADD CONSTRAINT "EventoEngajamento_estudanteId_fkey" FOREIGN KEY ("estudanteId") REFERENCES "Estudante"("id") ON DELETE SET NULL ON UPDATE CASCADE;
