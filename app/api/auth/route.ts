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
  if (!estudante || !estudante.ativo || !estudante.senhaHash) {
    return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
  }

  const senhaCorreta = await verificarSenha(senha, estudante.senhaHash);
  if (!senhaCorreta) {
    return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
  }

  await criarSessaoEstudante(estudante.id);

  await prisma.eventoEngajamento.create({
    data: { estudanteId: estudante.id, tipoEvento: "LOGIN" },
  });

  return NextResponse.json({ id: estudante.id, nome: estudante.nome });
}
