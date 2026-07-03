import { NextResponse } from "next/server";
import { AdminRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { lerEscopoAdminGlobal, podeGerenciarOrganizacao } from "@/lib/auth";
import { gerarTokenAleatorio, hashSenha } from "@/lib/hash";
import { criarOrgAdminSchema } from "@/lib/validations/admin";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const escopo = await lerEscopoAdminGlobal();
  if (!escopo) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id: organizacaoId } = await ctx.params;
  if (!podeGerenciarOrganizacao(escopo, organizacaoId)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const organizacao = await prisma.organizacao.findUnique({
    where: { id: organizacaoId },
    select: { id: true, ativo: true },
  });
  if (!organizacao) {
    return NextResponse.json({ error: "Organização não encontrada" }, { status: 404 });
  }
  if (!organizacao.ativo) {
    return NextResponse.json(
      { error: "Não é possível criar admin em organização inativa." },
      { status: 400 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = criarOrgAdminSchema.safeParse(body);
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
      role: AdminRole.ORG_ADMIN,
      organizacaoId,
      escolaId: null,
    },
    select: {
      id: true,
      nome: true,
      email: true,
      role: true,
      organizacaoId: true,
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
