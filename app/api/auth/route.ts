import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verificarSenha } from "@/lib/hash";
import { criarSessaoEstudante } from "@/lib/auth";
import { loginEstudanteSchema } from "@/lib/validations/cadastro";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = loginEstudanteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", detalhes: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { email, senha } = parsed.data;

  const estudante = await prisma.estudante.findUnique({ where: { email } });
  if (!estudante || !estudante.ativo) {
    return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
  }

  let autenticado = false;
  let viaToken = false;

  if (estudante.senhaHash) {
    autenticado = await verificarSenha(senha, estudante.senhaHash);
  }

  if (
    !autenticado &&
    estudante.tokenSenhaHash &&
    estudante.tokenSenhaExpiraEm &&
    estudante.tokenSenhaExpiraEm > new Date()
  ) {
    const senhaToken = senha.trim().toUpperCase();
    autenticado = await verificarSenha(senhaToken, estudante.tokenSenhaHash);
    viaToken = autenticado;
  }

  if (!autenticado) {
    return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
  }

  await criarSessaoEstudante(estudante.id);

  if (viaToken) {
    await prisma.estudante.update({
      where: { id: estudante.id },
      data: { tokenSenhaHash: null, tokenSenhaExpiraEm: null },
    });
  }

  await prisma.eventoEngajamento.create({
    data: { estudanteId: estudante.id, tipoEvento: "LOGIN" },
  });

  return NextResponse.json({ id: estudante.id, nome: estudante.nome });
}
