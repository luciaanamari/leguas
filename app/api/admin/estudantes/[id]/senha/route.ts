import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { lerEscopoAdmin, podeGerenciarEstudante } from "@/lib/auth";
import { gerarTokenAleatorio } from "@/lib/hash";
import { gerarSenhaEstudanteSchema } from "@/lib/validations/admin";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const escopo = await lerEscopoAdmin();
  if (!escopo) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const estudante = await prisma.estudante.findUnique({
    where: { id },
    select: {
      id: true,
      escolaId: true,
      escola: { select: { organizacaoId: true } },
    },
  });
  if (!estudante) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
  if (!podeGerenciarEstudante(escopo, estudante)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = gerarSenhaEstudanteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", detalhes: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (parsed.data.solicitacaoId) {
    const solicitacao = await prisma.solicitacaoRedefinicaoSenha.findFirst({
      where: {
        id: parsed.data.solicitacaoId,
        estudanteId: id,
        status: "PENDENTE",
      },
      select: { id: true },
    });
    if (!solicitacao) {
      return NextResponse.json(
        { error: "Solicitação pendente não encontrada para este estudante." },
        { status: 404 },
      );
    }
  }

  const token = gerarTokenAleatorio(8);
  const tokenHash = await bcrypt.hash(token, 10);
  const expiraEm = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.$transaction(async (tx) => {
    await tx.estudante.update({
      where: { id },
      data: { tokenSenhaHash: tokenHash, tokenSenhaExpiraEm: expiraEm },
    });

    if (parsed.data.solicitacaoId) {
      await tx.solicitacaoRedefinicaoSenha.update({
        where: { id: parsed.data.solicitacaoId },
        data: {
          status: "ATENDIDA",
          atendidaPorAdminId: escopo.sub,
          atendidaEm: new Date(),
        },
      });
    }
  });

  return NextResponse.json({ token, expiraEm: expiraEm.toISOString() });
}
