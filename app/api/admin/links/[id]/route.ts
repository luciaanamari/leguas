import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { lerEscopoAdmin, podeGerenciarEscola } from "@/lib/auth";
import { atualizarLinkSchema } from "@/lib/validations/link";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Alterna o link permanente da escola entre "cadastro aberto" (ativo=true) e
 * "cadastro fechado" (ativo=false). O login do aluno existente não depende
 * disso — a rota /e/{slug} continua resolvendo enquanto escola e org estiverem
 * ativas. Não há criação/remoção de links no fase 1 (um link fixo por escola).
 */
export async function PATCH(req: Request, ctx: Ctx) {
  const escopo = await lerEscopoAdmin();
  if (!escopo) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await ctx.params;
  const link = await prisma.linkCadastro.findUnique({
    where: { id },
    include: { escola: { select: { id: true, organizacaoId: true } } },
  });
  if (!link) return NextResponse.json({ error: "Link não encontrado" }, { status: 404 });

  if (!podeGerenciarEscola(escopo, link.escola)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = atualizarLinkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", detalhes: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const atualizado = await prisma.linkCadastro.update({
    where: { id: link.id },
    data: { ativo: parsed.data.ativo },
  });
  return NextResponse.json({ link: atualizado });
}
