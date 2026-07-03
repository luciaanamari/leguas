import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ehAdminGlobal, lerEscopoAdmin, type AdminSessionScope } from "@/lib/auth";
import { escolaSchema } from "@/lib/validations/admin";
import { garantirLinkPermanente } from "@/lib/links";

function escopoDeQueryEscolas(session: AdminSessionScope): Prisma.EscolaWhereInput {
  if (ehAdminGlobal(session)) return {};

  if (session.adminRole === "ORG_ADMIN" && session.organizacaoId) {
    return { organizacaoId: session.organizacaoId };
  }

  if (session.adminRole === "ESCOLA_ADMIN" && session.escolaId) {
    return { id: session.escolaId };
  }

  return { id: { in: [] } };
}

export async function GET() {
  const escopo = await lerEscopoAdmin();
  if (!escopo) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const escolas = await prisma.escola.findMany({
    where: escopoDeQueryEscolas(escopo),
    orderBy: [{ ativo: "desc" }, { nome: "asc" }],
    include: {
      organizacao: { select: { id: true, nome: true, slug: true } },
      _count: { select: { estudantes: true, admins: true } },
    },
  });

  return NextResponse.json({ escolas });
}

export async function POST(req: Request) {
  const escopo = await lerEscopoAdmin();
  if (!escopo) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (escopo.adminRole === "ESCOLA_ADMIN") {
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
      { error: "Não é possível criar escola em organização inativa." },
      { status: 400 },
    );
  }

  const escola = await prisma.escola.create({ data: parsed.data });
  // Toda escola nasce com seu link permanente de cadastro/login.
  await garantirLinkPermanente(escola.id, escola.nome);
  return NextResponse.json({ escola }, { status: 201 });
}
