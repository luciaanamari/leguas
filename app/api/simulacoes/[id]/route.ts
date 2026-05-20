import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { lerSessaoEstudante } from "@/lib/auth";

type Params = Promise<{ id: string }>;

export async function DELETE(_req: Request, { params }: { params: Params }) {
  const sessao = await lerSessaoEstudante();
  if (!sessao) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { id } = await params;

  const simulacao = await prisma.simulacao.findUnique({
    where: { id },
    select: { estudanteId: true },
  });

  if (!simulacao) {
    return NextResponse.json({ error: "Simulação não encontrada." }, { status: 404 });
  }

  if (simulacao.estudanteId !== sessao.sub) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  // Cascade deletes resultado too (schema has onDelete: Cascade on ResultadoMatch.simulacaoId)
  await prisma.simulacao.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}
