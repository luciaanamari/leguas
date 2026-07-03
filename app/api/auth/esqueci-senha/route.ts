import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  esqueciSenhaSchema,
  MENSAGEM_ESQUECI_SENHA_GENERICO,
} from "@/lib/validations/esqueci-senha";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = esqueciSenhaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", detalhes: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { email } = parsed.data;

  const estudante = await prisma.estudante.findUnique({
    where: { email },
    select: { id: true, ativo: true },
  });

  if (estudante?.ativo) {
    const pendente = await prisma.solicitacaoRedefinicaoSenha.findFirst({
      where: { estudanteId: estudante.id, status: "PENDENTE" },
      select: { id: true },
    });
    if (!pendente) {
      await prisma.solicitacaoRedefinicaoSenha.create({
        data: { estudanteId: estudante.id },
      });
    }
  }

  // Resposta genérica (mesma para existente/inexistente) evita enumeração.
  return NextResponse.json({ mensagem: MENSAGEM_ESQUECI_SENHA_GENERICO });
}
