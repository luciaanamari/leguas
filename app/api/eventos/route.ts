import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { lerSessaoEstudante } from "@/lib/auth";
import { TipoEvento } from "@prisma/client";

const schema = z.object({
  tipoEvento: z.nativeEnum(TipoEvento),
  payload: z.unknown().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const sessao = await lerSessaoEstudante();

  const evento = await prisma.eventoEngajamento.create({
    data: {
      estudanteId: sessao?.sub ?? null,
      tipoEvento: parsed.data.tipoEvento,
      payload: (parsed.data.payload ?? undefined) as never,
    },
  });

  if (parsed.data.tipoEvento === "RESULTADO_COMPARTILHADO") {
    const payload = parsed.data.payload as { resultadoId?: string } | undefined;
    if (payload?.resultadoId) {
      await prisma.resultadoMatch
        .update({
          where: { id: payload.resultadoId },
          data: { compartilhado: true },
        })
        .catch(() => null);
    }
  }

  return NextResponse.json({ id: evento.id }, { status: 201 });
}
