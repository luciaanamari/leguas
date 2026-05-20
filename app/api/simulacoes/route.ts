import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { lerSessaoEstudante } from "@/lib/auth";
import { buscarCurso } from "@/lib/data/cursos";

const iniciarSchema = z.object({
  slug: z.string().min(1),
  areaSlug: z.string().min(1),
  cursoSlug: z.string().min(1),
});

export async function POST(req: Request) {
  const sessao = await lerSessaoEstudante();
  if (!sessao) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = iniciarSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  const trilha = await prisma.trilha.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (!trilha || !trilha.ativo) {
    return NextResponse.json({ error: "Trilha não encontrada." }, { status: 404 });
  }
  const curso = buscarCurso(parsed.data.areaSlug, parsed.data.cursoSlug);
  if (!curso) {
    return NextResponse.json({ error: "Curso não encontrado." }, { status: 404 });
  }
  const simulacao = await prisma.simulacao.create({
    data: {
      estudanteId: sessao.sub,
      trilhaId: trilha.id,
      areaSlug: parsed.data.areaSlug,
      cursoSlug: parsed.data.cursoSlug,
      narrativaAluno: curso.narrativaEstudante,
      narrativaProfissional: curso.narrativaProfissional,
    },
  });
  await prisma.eventoEngajamento.create({
    data: {
      estudanteId: sessao.sub,
      tipoEvento: "SIMULACAO_INICIADA",
      payload: {
        simulacaoId: simulacao.id,
        slug: trilha.slug,
        areaSlug: parsed.data.areaSlug,
        cursoSlug: parsed.data.cursoSlug,
      },
    },
  });
  return NextResponse.json({ simulacao }, { status: 201 });
}

export async function GET() {
  const sessao = await lerSessaoEstudante();
  if (!sessao) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const simulacoes = await prisma.simulacao.findMany({
    where: { estudanteId: sessao.sub, concluidaEm: { not: null } },
    include: {
      trilha: { select: { slug: true, titulo: true, modalidade: true } },
      resultado: { select: { pontuacao: true, criadoEm: true } },
    },
    orderBy: { iniciadaEm: "desc" },
  });
  return NextResponse.json({ simulacoes });
}
