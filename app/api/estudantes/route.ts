import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashCpf, hashSenha, hashWhatsapp } from "@/lib/hash";
import { criarSessaoEstudante } from "@/lib/auth";
import { cadastroSchema } from "@/lib/validations/cadastro";
import { calcularDisc } from "@/lib/data/quiz-disc";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = cadastroSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", detalhes: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const dados = parsed.data;

  const emailExistente = await prisma.estudante.findUnique({
    where: { email: dados.email },
  });
  if (emailExistente) {
    return NextResponse.json(
      { error: "Já existe uma conta com esse e-mail. Faça login para continuar." },
      { status: 409 },
    );
  }

  const cpfHash = hashCpf(dados.cpf);
  const cpfExistente = await prisma.estudante.findUnique({ where: { cpfHash } });
  if (cpfExistente) {
    return NextResponse.json(
      { error: "Já existe um cadastro com esse CPF." },
      { status: 409 },
    );
  }

  const senhaHashValue = await hashSenha(dados.senha);
  const whatsappDigits =
    typeof dados.whatsapp === "string" ? dados.whatsapp.replace(/\D/g, "") : "";
  const whatsappHashValue =
    whatsappDigits.length >= 10 ? hashWhatsapp(whatsappDigits) : null;

  const resultadoDisc = calcularDisc(dados.respostasDisc);

  const estudante = await prisma.estudante.create({
    data: {
      nome: dados.nome,
      email: dados.email,
      senhaHash: senhaHashValue,
      dataNascimento: new Date(dados.dataNascimento),
      cpfHash,
      whatsappHash: whatsappHashValue,
      rendaFamiliar: dados.rendaFamiliar,
      escolaNome: dados.escolaNome,
      escolaAno: dados.escolaAno,
      cursoTecnico: dados.cursoTecnico ?? null,
      perfilEmpreendedor: dados.perfilEmpreendedor,
      preocupacoes: dados.preocupacoes,
      areaQuizH: resultadoDisc.areaH,
      areaQuizE: resultadoDisc.areaE,
      areaQuizB: resultadoDisc.areaB,
      discPerfil: resultadoDisc.disc,
      respostasDisc: dados.respostasDisc,
    },
  });

  await criarSessaoEstudante(estudante.id);

  await prisma.eventoEngajamento.create({
    data: { estudanteId: estudante.id, tipoEvento: "SESSAO_INICIADA" },
  });

  return NextResponse.json({ id: estudante.id, nome: estudante.nome }, { status: 201 });
}
