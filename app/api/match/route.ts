import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { lerSessaoEstudante } from "@/lib/auth";
import { calcularMatch } from "@/lib/match/engine";
import { calcularDisc, type RespostaDisc } from "@/lib/data/quiz-disc";

const respostaSchema = z.object({
  perguntaId: z.number().int().min(1).max(99),
  resposta: z.enum(["SIM", "MAIS_OU_MENOS", "NAO"]),
});

const schema = z.object({
  simulacaoId: z.string().min(1),
  respostas: z.array(respostaSchema).min(1),
});

export async function POST(req: Request) {
  const sessao = await lerSessaoEstudante();
  if (!sessao) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", detalhes: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { simulacaoId, respostas } = parsed.data;

  const simulacao = await prisma.simulacao.findUnique({
    where: { id: simulacaoId },
    include: { trilha: true, estudante: true, resultado: true },
  });
  if (!simulacao || simulacao.estudanteId !== sessao.sub) {
    return NextResponse.json(
      { error: "Simulação não encontrada." },
      { status: 404 },
    );
  }

  // Idempotencia: devolve o resultado existente se ja calculado
  if (simulacao.resultado) {
    return NextResponse.json({ resultado: simulacao.resultado });
  }

  // Busca nome do curso a partir do JSON estatico
  const { buscarCurso } = await import("@/lib/data/cursos");
  const curso = buscarCurso(simulacao.areaSlug, simulacao.cursoSlug);
  const cursoNome = curso?.nome ?? simulacao.cursoSlug;

  const estudante = simulacao.estudante;
  // Recalcula a contagem DISC a partir das respostas armazenadas - usada para a
  // tela de transparencia. Falha silenciosa se respostas estiverem corrompidas.
  let contagemDisc = { D: 0, I: 0, S: 0, C: 0 };
  try {
    const r = estudante.respostasDisc as unknown as RespostaDisc[];
    if (Array.isArray(r)) contagemDisc = calcularDisc(r).contagemDisc;
  } catch {
    // mantem zeros
  }

  const resultadoEngine = calcularMatch({
    areaQuizH: estudante.areaQuizH,
    areaQuizE: estudante.areaQuizE,
    areaQuizB: estudante.areaQuizB,
    discPerfil: estudante.discPerfil,
    contagemDisc,
    rendaFamiliar: estudante.rendaFamiliar,
    perfilEmpreendedor: estudante.perfilEmpreendedor,
    preocupacoes: estudante.preocupacoes,
    anoCursando: estudante.escolaAno,
    cursoTecnicoFeito: estudante.cursoTecnico,
    trilhaSlug: simulacao.trilha.slug,
    trilhaTitulo: simulacao.trilha.titulo,
    trilhaModalidade: simulacao.trilha.modalidade,
    areaCursoSlug: simulacao.areaSlug,
    cursoSlug: simulacao.cursoSlug,
    cursoNome,
    respostasAfinidade: respostas,
  });

  await prisma.simulacao.update({
    where: { id: simulacao.id },
    data: {
      concluidaEm: new Date(),
      respostasAfinidade: respostas,
    },
  });

  const resultado = await prisma.resultadoMatch.create({
    data: {
      estudanteId: simulacao.estudanteId,
      trilhaId: simulacao.trilhaId,
      simulacaoId: simulacao.id,
      pontuacao: resultadoEngine.pontuacao,
      pontuacaoArea: resultadoEngine.pontuacaoArea,
      pontuacaoCurso: resultadoEngine.pontuacaoCurso,
      faixa: resultadoEngine.faixa,
      tituloDisc: resultadoEngine.tituloDisc,
      areaDominante: resultadoEngine.areaDominante,
      cursoSlug: simulacao.cursoSlug,
      justificativa: resultadoEngine.justificativa,
      proximoPasso: resultadoEngine.proximoPasso,
      contextoBlocos: resultadoEngine.contextoBlocos,
      explicacao: resultadoEngine.explicacao as unknown as object,
    },
  });

  await prisma.eventoEngajamento.create({
    data: {
      estudanteId: simulacao.estudanteId,
      tipoEvento: "SIMULACAO_CONCLUIDA",
      payload: {
        simulacaoId: simulacao.id,
        pontuacao: resultado.pontuacao,
        faixa: resultadoEngine.faixa,
        cursoSlug: simulacao.cursoSlug,
      },
    },
  });

  return NextResponse.json({ resultado }, { status: 201 });
}
