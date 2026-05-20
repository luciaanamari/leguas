import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { lerSessaoAdmin } from "@/lib/auth";
import { gerarTokenAleatorio } from "@/lib/hash";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  if (!(await lerSessaoAdmin())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const estudante = await prisma.estudante.findUnique({ where: { id } });
  if (!estudante) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const token = gerarTokenAleatorio(8);
  const tokenHash = await bcrypt.hash(token, 10);
  const expiraEm = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.estudante.update({
    where: { id },
    data: { tokenSenhaHash: tokenHash, tokenSenhaExpiraEm: expiraEm },
  });

  // Retornar o token em texto puro apenas nessa resposta (instrucao do CLAUDE.md)
  return NextResponse.json({ token, expiraEm: expiraEm.toISOString() });
}
