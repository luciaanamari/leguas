import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { lerEscopoAdmin, podeGerenciarEscola } from "@/lib/auth";
import {
  removerLogoEscola,
  salvarLogoEscola,
  validarArquivoLogo,
} from "@/lib/branding";

type Ctx = { params: Promise<{ id: string }> };

async function carregarEscolaAutorizada(escolaId: string) {
  const escopo = await lerEscopoAdmin();
  if (!escopo) return { erro: NextResponse.json({ error: "Não autorizado" }, { status: 401 }) };

  const escola = await prisma.escola.findUnique({
    where: { id: escolaId },
    select: { id: true, organizacaoId: true, logoUrl: true },
  });
  if (!escola) return { erro: NextResponse.json({ error: "Escola não encontrada" }, { status: 404 }) };

  if (!podeGerenciarEscola(escopo, escola)) {
    return { erro: NextResponse.json({ error: "Acesso negado" }, { status: 403 }) };
  }
  return { escola };
}

export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const { erro, escola } = await carregarEscolaAutorizada(id);
  if (erro) return erro;

  const form = await req.formData().catch(() => null);
  const campo = form?.get("logo");
  if (!campo || !(campo instanceof File)) {
    return NextResponse.json(
      { error: "Envie o arquivo no campo logo (multipart/form-data)." },
      { status: 400 },
    );
  }

  const validado = await validarArquivoLogo(campo);
  if (!validado.ok) {
    return NextResponse.json({ error: validado.error }, { status: 400 });
  }

  const logoUrl = await salvarLogoEscola(
    validado.buffer,
    escola!.organizacaoId,
    escola!.id,
    validado.mime,
  );

  const atualizada = await prisma.escola.update({
    where: { id: escola!.id },
    data: { logoUrl },
    select: { id: true, logoUrl: true },
  });

  return NextResponse.json({ escola: atualizada });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const { erro, escola } = await carregarEscolaAutorizada(id);
  if (erro) return erro;

  await removerLogoEscola(escola!.organizacaoId, escola!.id);
  const atualizada = await prisma.escola.update({
    where: { id: escola!.id },
    data: { logoUrl: null },
    select: { id: true, logoUrl: true },
  });

  return NextResponse.json({ escola: atualizada });
}
