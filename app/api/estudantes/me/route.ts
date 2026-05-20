import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { lerSessaoEstudante } from "@/lib/auth";
import { hashWhatsapp } from "@/lib/hash";

const schema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres.").optional(),
  whatsapp: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine(
      (v) => v.length === 0 || (v.length >= 10 && v.length <= 11),
      "WhatsApp inválido.",
    )
    .optional(),
  escolaNome: z.string().min(3, "Nome da escola deve ter pelo menos 3 caracteres.").optional(),
  escolaAno: z.enum(["PRIMEIRO", "SEGUNDO", "TERCEIRO"]).optional(),
  cursoTecnico: z.string().optional().nullable(),
});

export async function PUT(req: Request) {
  const sessao = await lerSessaoEstudante();
  if (!sessao) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", detalhes: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { whatsapp, ...rest } = parsed.data;
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "Nenhum campo para atualizar." }, { status: 400 });
  }

  const whatsappHash =
    typeof whatsapp === "string" && whatsapp.length >= 10
      ? hashWhatsapp(whatsapp)
      : whatsapp === ""
        ? null
        : undefined;

  const updateData: Record<string, unknown> = { ...rest };
  if (whatsappHash !== undefined) updateData.whatsappHash = whatsappHash;

  const estudante = await prisma.estudante.update({
    where: { id: sessao.sub },
    data: updateData,
    select: {
      id: true,
      nome: true,
      escolaNome: true,
      escolaAno: true,
      cursoTecnico: true,
    },
  });

  return NextResponse.json({ estudante });
}
