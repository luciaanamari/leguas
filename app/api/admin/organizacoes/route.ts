import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { lerEscopoAdminGlobal } from "@/lib/auth";
import { organizacaoSchema } from "@/lib/validations/admin";

export async function GET() {
  const escopo = await lerEscopoAdminGlobal();
  if (!escopo) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const organizacoes = await prisma.organizacao.findMany({
    orderBy: [{ ativo: "desc" }, { nome: "asc" }],
    include: {
      _count: { select: { escolas: true, admins: true } },
    },
  });

  return NextResponse.json({ organizacoes });
}

export async function POST(req: Request) {
  const escopo = await lerEscopoAdminGlobal();
  if (!escopo) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = organizacaoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", detalhes: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existente = await prisma.organizacao.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (existente) {
    return NextResponse.json(
      { error: "Já existe uma organização com esse slug." },
      { status: 409 },
    );
  }

  const organizacao = await prisma.organizacao.create({ data: parsed.data });
  return NextResponse.json({ organizacao }, { status: 201 });
}
