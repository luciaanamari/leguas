import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { lerEscopoAdmin, podeGerenciarEscola } from "@/lib/auth";
import { escolaSchema } from "@/lib/validations/admin";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const escopo = await lerEscopoAdmin();
  if (!escopo) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const escola = await prisma.escola.findUnique({
    where: { id },
    include: {
      organizacao: { select: { id: true, nome: true, slug: true } },
      admins: {
        where: { role: "ESCOLA_ADMIN", ativo: true },
        select: { id: true, nome: true, email: true, criadoEm: true },
        orderBy: { nome: "asc" },
      },
      _count: { select: { estudantes: true } },
    },
  });
  if (!escola) {
    return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
  }

  if (!podeGerenciarEscola(escopo, escola)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  return NextResponse.json({ escola });
}

export async function PUT(req: Request, ctx: Ctx) {
  const escopo = await lerEscopoAdmin();
  if (!escopo) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (escopo.adminRole === "ESCOLA_ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const existente = await prisma.escola.findUnique({ where: { id } });
  if (!existente) {
    return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
  }

  if (!podeGerenciarEscola(escopo, existente)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = escolaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", detalhes: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (
    escopo.adminRole === "ORG_ADMIN" &&
    parsed.data.organizacaoId !== escopo.organizacaoId
  ) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const organizacao = await prisma.organizacao.findUnique({
    where: { id: parsed.data.organizacaoId },
    select: { id: true, ativo: true },
  });
  if (!organizacao) {
    return NextResponse.json({ error: "Organização não encontrada" }, { status: 404 });
  }
  if (!organizacao.ativo) {
    return NextResponse.json(
      { error: "Não é possível vincular escola a organização inativa." },
      { status: 400 },
    );
  }

  const escola = await prisma.escola.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json({ escola });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const escopo = await lerEscopoAdmin();
  if (!escopo) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (escopo.adminRole === "ESCOLA_ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const existente = await prisma.escola.findUnique({ where: { id } });
  if (!existente) {
    return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
  }

  if (!podeGerenciarEscola(escopo, existente)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const escola = await prisma.escola.update({
    where: { id },
    data: { ativo: false },
  });
  return NextResponse.json({ escola });
}
