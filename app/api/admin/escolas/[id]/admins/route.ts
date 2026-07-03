import { NextResponse } from "next/server";
import { AdminRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ehAdminGlobal, lerEscopoAdmin, podeGerenciarEscola } from "@/lib/auth";
import { gerarTokenAleatorio, hashSenha } from "@/lib/hash";
import { criarEscolaAdminSchema } from "@/lib/validations/admin";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const escopo = await lerEscopoAdmin();
  if (!escopo) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (!ehAdminGlobal(escopo) && escopo.adminRole !== "ORG_ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { id: escolaId } = await ctx.params;
  const escola = await prisma.escola.findUnique({
    where: { id: escolaId },
    select: { id: true, ativo: true, organizacaoId: true },
  });
  if (!escola) {
    return NextResponse.json({ error: "Escola não encontrada" }, { status: 404 });
  }

  if (!podeGerenciarEscola(escopo, escola)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  if (!escola.ativo) {
    return NextResponse.json(
      { error: "Não é possível criar admin em escola inativa." },
      { status: 400 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = criarEscolaAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", detalhes: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const emailEmUso = await prisma.admin.findUnique({
    where: { email: parsed.data.email },
  });
  if (emailEmUso) {
    return NextResponse.json({ error: "E-mail já cadastrado." }, { status: 409 });
  }

  const senhaTemporaria = gerarTokenAleatorio(8);
  const senhaHash = await hashSenha(senhaTemporaria);

  const admin = await prisma.admin.create({
    data: {
      nome: parsed.data.nome,
      email: parsed.data.email,
      senhaHash,
      role: AdminRole.ESCOLA_ADMIN,
      organizacaoId: escola.organizacaoId,
      escolaId,
    },
    select: {
      id: true,
      nome: true,
      email: true,
      role: true,
      organizacaoId: true,
      escolaId: true,
      criadoEm: true,
    },
  });

  return NextResponse.json(
    {
      admin,
      senhaTemporaria,
      aviso: "Guarde a senha temporária — ela não será exibida novamente.",
    },
    { status: 201 },
  );
}
