import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { lerEscopoAdmin, escopoSolicitacoesSenha } from "@/lib/auth";

export async function GET() {
  const escopo = await lerEscopoAdmin();
  if (!escopo) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const solicitacoes = await prisma.solicitacaoRedefinicaoSenha.findMany({
    where: escopoSolicitacoesSenha(escopo),
    orderBy: { criadoEm: "asc" },
    include: {
      estudante: {
        select: {
          id: true,
          nome: true,
          email: true,
          escolaId: true,
          escola: {
            select: {
              nome: true,
              organizacao: { select: { nome: true } },
            },
          },
        },
      },
    },
  });

  return NextResponse.json({ solicitacoes });
}
