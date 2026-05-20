import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { lerSessaoAdmin } from "@/lib/auth";
import { profissaoSchema } from "@/lib/validations/admin";

export async function GET() {
  if (!(await lerSessaoAdmin())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const profissoes = await prisma.profissao.findMany({
    include: { trilha: { select: { titulo: true } } },
    orderBy: { nome: "asc" },
  });
  return NextResponse.json({ profissoes });
}

export async function POST(req: Request) {
  if (!(await lerSessaoAdmin())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = profissaoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", detalhes: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const profissao = await prisma.profissao.create({ data: parsed.data });
  return NextResponse.json({ profissao }, { status: 201 });
}
