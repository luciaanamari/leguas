import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { lerSessaoAdmin } from "@/lib/auth";
import { trilhaSchema } from "@/lib/validations/admin";

async function exigirAdmin() {
  const sessao = await lerSessaoAdmin();
  if (!sessao) return null;
  return sessao;
}

export async function GET() {
  if (!(await exigirAdmin())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const trilhas = await prisma.trilha.findMany({ orderBy: [{ ativo: "desc" }, { ordem: "asc" }] });
  return NextResponse.json({ trilhas });
}

export async function POST(req: Request) {
  if (!(await exigirAdmin())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = trilhaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", detalhes: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const existente = await prisma.trilha.findUnique({ where: { slug: parsed.data.slug } });
  if (existente) {
    return NextResponse.json({ error: "Já existe uma trilha com esse slug." }, { status: 409 });
  }
  const trilha = await prisma.trilha.create({ data: parsed.data });
  return NextResponse.json({ trilha }, { status: 201 });
}
