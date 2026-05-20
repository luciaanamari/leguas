import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { lerSessaoAdmin } from "@/lib/auth";
import { profissaoSchema } from "@/lib/validations/admin";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  if (!(await lerSessaoAdmin())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const profissao = await prisma.profissao.findUnique({ where: { id } });
  if (!profissao) return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
  return NextResponse.json({ profissao });
}

export async function PUT(req: Request, ctx: Ctx) {
  if (!(await lerSessaoAdmin())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = profissaoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", detalhes: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const profissao = await prisma.profissao.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ profissao });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  if (!(await lerSessaoAdmin())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const profissao = await prisma.profissao.update({
    where: { id },
    data: { ativo: false },
  });
  return NextResponse.json({ profissao });
}
