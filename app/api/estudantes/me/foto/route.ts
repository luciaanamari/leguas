import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { lerSessaoEstudante } from "@/lib/auth";
import { validarArquivoLogo } from "@/lib/branding";
import { removerFotoAluno, salvarFotoAluno } from "@/lib/storage/foto-aluno";

async function carregarEstudante() {
  const sessao = await lerSessaoEstudante();
  if (!sessao) return null;
  return prisma.estudante.findUnique({
    where: { id: sessao.sub },
    select: {
      id: true,
      ativo: true,
      escolaId: true,
      fotoPerfilKey: true,
      escola: { select: { organizacaoId: true } },
    },
  });
}

export async function POST(req: Request) {
  const estudante = await carregarEstudante();
  if (!estudante || !estudante.ativo) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  const campo = form?.get("foto");
  if (!campo || !(campo instanceof File)) {
    return NextResponse.json(
      { error: "Envie o arquivo no campo foto (multipart/form-data)." },
      { status: 400 },
    );
  }

  const validado = await validarArquivoLogo(campo);
  if (!validado.ok) {
    return NextResponse.json({ error: validado.error }, { status: 400 });
  }

  const key = await salvarFotoAluno(
    validado.buffer,
    {
      alunoId: estudante.id,
      organizacaoId: estudante.escola?.organizacaoId ?? null,
      escolaId: estudante.escolaId,
    },
    validado.mime,
  );

  await prisma.estudante.update({
    where: { id: estudante.id },
    data: { fotoPerfilKey: key },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const estudante = await carregarEstudante();
  if (!estudante || !estudante.ativo) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (estudante.fotoPerfilKey) {
    await removerFotoAluno(estudante.fotoPerfilKey);
    await prisma.estudante.update({
      where: { id: estudante.id },
      data: { fotoPerfilKey: null },
    });
  }

  return NextResponse.json({ ok: true });
}
