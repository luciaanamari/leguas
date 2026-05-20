import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const trilha = await prisma.trilha.findUnique({
    where: { slug },
    include: { profissoes: { where: { ativo: true }, orderBy: { nome: "asc" } } },
  });
  if (!trilha || !trilha.ativo) {
    return NextResponse.json({ error: "Trilha não encontrada." }, { status: 404 });
  }
  return NextResponse.json({ trilha });
}
