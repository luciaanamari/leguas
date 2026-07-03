import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { lerSessaoEstudante } from "@/lib/auth";
import { calcularDisc } from "@/lib/data/quiz-disc";
import { refazerQuizSchema } from "@/lib/validations/perfil-quiz";

const perfilSelect = {
  id: true,
  areaQuizH: true,
  areaQuizE: true,
  areaQuizB: true,
  discPerfil: true,
  vigente: true,
  criadoEm: true,
} as const;

export async function GET() {
  const sessao = await lerSessaoEstudante();
  if (!sessao) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const perfis = await prisma.perfilEstudante.findMany({
    where: { estudanteId: sessao.sub },
    select: perfilSelect,
    orderBy: { criadoEm: "desc" },
  });

  return NextResponse.json({ perfis });
}

export async function POST(req: Request) {
  const sessao = await lerSessaoEstudante();
  if (!sessao) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const estudante = await prisma.estudante.findUnique({
    where: { id: sessao.sub },
    select: { id: true, ativo: true },
  });
  if (!estudante?.ativo) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = refazerQuizSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", detalhes: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const resultadoDisc = calcularDisc(parsed.data.respostasDisc);

  const perfil = await prisma.$transaction(async (tx) => {
    await tx.perfilEstudante.updateMany({
      where: { estudanteId: sessao.sub, vigente: true },
      data: { vigente: false },
    });

    const criado = await tx.perfilEstudante.create({
      data: {
        estudanteId: sessao.sub,
        areaQuizH: resultadoDisc.areaH,
        areaQuizE: resultadoDisc.areaE,
        areaQuizB: resultadoDisc.areaB,
        discPerfil: resultadoDisc.disc,
        respostasDisc: parsed.data.respostasDisc,
        vigente: true,
      },
      select: perfilSelect,
    });

    await tx.estudante.update({
      where: { id: sessao.sub },
      data: {
        areaQuizH: resultadoDisc.areaH,
        areaQuizE: resultadoDisc.areaE,
        areaQuizB: resultadoDisc.areaB,
        discPerfil: resultadoDisc.disc,
        respostasDisc: parsed.data.respostasDisc,
      },
    });

    await tx.eventoEngajamento.create({
      data: {
        estudanteId: sessao.sub,
        tipoEvento: "QUIZ_REFITO",
        payload: { perfilId: criado.id },
      },
    });

    return criado;
  });

  return NextResponse.json({
    perfil,
    resultado: {
      areaH: resultadoDisc.areaH,
      areaE: resultadoDisc.areaE,
      areaB: resultadoDisc.areaB,
      disc: resultadoDisc.disc,
      areaDominante: resultadoDisc.areaDominante,
    },
  });
}
