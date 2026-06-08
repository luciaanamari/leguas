import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { lerSessaoAdmin } from "@/lib/auth";
import { estudanteUpdateSchema } from "@/lib/validations/admin";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  if (!(await lerSessaoAdmin())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const estudante = await prisma.estudante.findUnique({
    where: { id },
    select: {
      id: true,
      nome: true,
      escolaNome: true,
      escolaAno: true,
      cursoTecnico: true,
      whatsappHash: true,
      rendaFamiliar: true,
      perfilEmpreendedor: true,
      preocupacoes: true,
      discPerfil: true,
      areaQuizH: true,
      areaQuizE: true,
      areaQuizB: true,
      dataNascimento: true,
      ativo: true,
      criadoEm: true,
    },
  });
  if (!estudante) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json({ estudante });
}

export async function PUT(req: Request, ctx: Ctx) {
  if (!(await lerSessaoAdmin())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = estudanteUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", detalhes: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const estudante = await prisma.estudante.update({ where: { id }, data: parsed.data });
  return NextResponse.json({
    estudante: {
      id: estudante.id,
      nome: estudante.nome,
      ativo: estudante.ativo,
    },
  });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  if (!(await lerSessaoAdmin())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const existe = await prisma.estudante.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existe) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });

  // Hard delete - cascades to Simulacao, ResultadoMatch, EventoEngajamento
  await prisma.estudante.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
