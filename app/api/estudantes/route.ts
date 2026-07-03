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

  // Dois modos de cadastro:
  // - Institucional (com escolaId): escola/org vêm do link; valida vínculo e
  //   se o link permanente está aberto. escolaNome é a própria escola.
  // - Independente (sem escolaId): escolaId fica nulo e escolaNome é o texto
  //   livre informado pelo aluno (campo não obrigatório).
  let escolaIdFinal: string | null = null;
  let escolaNomeFinal = "";

  if (dados.escolaId) {
    const escola = await prisma.escola.findUnique({
      where: { id: dados.escolaId },
      select: {
        id: true,
        nome: true,
        ativo: true,
        organizacaoId: true,
        organizacao: { select: { ativo: true } },
      },
    });

    if (!escola?.ativo || !escola.organizacao.ativo) {
      return NextResponse.json(
        { error: "Escola ou organização inválida." },
        { status: 400 },
      );
    }

    if (dados.organizacaoId && escola.organizacaoId !== dados.organizacaoId) {
      return NextResponse.json(
        { error: "A escola selecionada não pertence à organização informada." },
        { status: 400 },
      );
    }

    // O cadastro por link só é aceito se o link permanente estiver aberto.
    const linkAberto = await prisma.linkCadastro.findFirst({
      where: { escolaId: escola.id, permanente: true, ativo: true },
      select: { id: true },
    });
    if (!linkAberto) {
      return NextResponse.json(
        { error: "As inscrições desta escola estão fechadas no momento." },
        { status: 403 },
      );
    }

    escolaIdFinal = escola.id;
    escolaNomeFinal = escola.nome;
  } else {
    escolaNomeFinal = dados.escolaNome ?? "";
  }

  const emailExistente = await prisma.estudante.findUnique({
    where: { email: dados.email },
  });
  if (emailExistente) {
    return NextResponse.json(
      { error: "Já existe uma conta com esse e-mail. Faça login para continuar." },
      { status: 409 },
    );
  }

  // CPF é opcional: só hasheia e checa unicidade quando informado (11 dígitos).
  // Vazio vira null (o índice único permite múltiplos nulos).
  const cpfDigits = (dados.cpf ?? "").replace(/\D/g, "");
  let cpfHash: string | null = null;
  if (cpfDigits.length === 11) {
    cpfHash = hashCpf(cpfDigits);
    const cpfExistente = await prisma.estudante.findUnique({ where: { cpfHash } });
    if (cpfExistente) {
      return NextResponse.json(
        { error: "Já existe um cadastro com esse CPF." },
        { status: 409 },
      );
    }
  }

  const senhaHashValue = await hashSenha(dados.senha);
  const whatsappDigits =
    typeof dados.whatsapp === "string" ? dados.whatsapp.replace(/\D/g, "") : "";
  const whatsappHashValue =
    whatsappDigits.length >= 10 ? hashWhatsapp(whatsappDigits) : null;

  const resultadoDisc = calcularDisc(dados.respostasDisc);

  const estudante = await prisma.$transaction(async (tx) => {
    const criado = await tx.estudante.create({
      data: {
        nome: dados.nome,
        email: dados.email,
        senhaHash: senhaHashValue,
        dataNascimento: new Date(dados.dataNascimento),
        cpfHash,
        whatsappHash: whatsappHashValue,
        sexo: dados.sexo,
        rendaFamiliar: dados.rendaFamiliar,
        escolaId: escolaIdFinal,
        escolaNome: escolaNomeFinal,
        escolaAno: dados.escolaAno,
        cursoTecnico: dados.cursoTecnico ?? null,
        matricula: dados.matricula || null,
        perfilEmpreendedor: dados.perfilEmpreendedor,
        preocupacoes: dados.preocupacoes,
        areaQuizH: resultadoDisc.areaH,
        areaQuizE: resultadoDisc.areaE,
        areaQuizB: resultadoDisc.areaB,
        discPerfil: resultadoDisc.disc,
        respostasDisc: dados.respostasDisc,
      },
    });

    await tx.perfilEstudante.create({
      data: {
        estudanteId: criado.id,
        areaQuizH: resultadoDisc.areaH,
        areaQuizE: resultadoDisc.areaE,
        areaQuizB: resultadoDisc.areaB,
        discPerfil: resultadoDisc.disc,
        respostasDisc: dados.respostasDisc,
        vigente: true,
      },
    });

    return criado;
  });

  await criarSessaoEstudante(estudante.id);

  await prisma.eventoEngajamento.create({
    data: { estudanteId: estudante.id, tipoEvento: "SESSAO_INICIADA" },
  });

  return NextResponse.json({ id: estudante.id, nome: estudante.nome }, { status: 201 });
}
