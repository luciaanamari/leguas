import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { lerEscopoAdminGlobal, podeGerenciarOrganizacao } from "@/lib/auth";
import { organizacaoSchema } from "@/lib/validations/admin";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const escopo = await lerEscopoAdminGlobal();
  if (!escopo) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  if (!podeGerenciarOrganizacao(escopo, id)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const organizacao = await prisma.organizacao.findUnique({
    where: { id },
    include: {
      escolas: { orderBy: { nome: "asc" } },
      admins: {
        where: { role: "ORG_ADMIN", ativo: true },
        select: { id: true, nome: true, email: true, criadoEm: true },
        orderBy: { nome: "asc" },
      },
    },
  });
  if (!organizacao) {
    return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ organizacao });
}

export async function PUT(req: Request, ctx: Ctx) {
  const escopo = await lerEscopoAdminGlobal();
  if (!escopo) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  if (!podeGerenciarOrganizacao(escopo, id)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = organizacaoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", detalhes: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const conflito = await prisma.organizacao.findFirst({
    where: { slug: parsed.data.slug, NOT: { id } },
  });
  if (conflito) {
    return NextResponse.json({ error: "Slug já em uso." }, { status: 409 });
  }

  const organizacao = await prisma.organizacao.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json({ organizacao });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const escopo = await lerEscopoAdminGlobal();
  if (!escopo) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  if (!podeGerenciarOrganizacao(escopo, id)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const organizacao = await prisma.organizacao.update({
    where: { id },
    data: { ativo: false },
  });
  return NextResponse.json({ organizacao });
}
