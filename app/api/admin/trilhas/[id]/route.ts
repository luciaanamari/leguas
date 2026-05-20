import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { lerSessaoAdmin } from "@/lib/auth";
import { trilhaSchema } from "@/lib/validations/admin";

async function exigirAdmin() {
  return lerSessaoAdmin();
}

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  if (!(await exigirAdmin())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const trilha = await prisma.trilha.findUnique({
    where: { id },
    include: { profissoes: true },
  });
  if (!trilha) return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
  return NextResponse.json({ trilha });
}

export async function PUT(req: Request, ctx: Ctx) {
  if (!(await exigirAdmin())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = trilhaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", detalhes: parsed.error.flatten() },
      { status: 400 },
    );
  }
  // Garante que outro registro nao usa o mesmo slug
  const conflito = await prisma.trilha.findFirst({
    where: { slug: parsed.data.slug, NOT: { id } },
  });
  if (conflito) {
    return NextResponse.json({ error: "Slug já em uso." }, { status: 409 });
  }
  const trilha = await prisma.trilha.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ trilha });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  if (!(await exigirAdmin())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await ctx.params;
  // Soft delete
  const trilha = await prisma.trilha.update({
    where: { id },
    data: { ativo: false },
  });
  return NextResponse.json({ trilha });
}
