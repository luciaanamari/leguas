import { NextResponse } from "next/server";
import { encerrarSessaoEstudante, lerSessaoEstudante } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  const sessao = await lerSessaoEstudante();
  if (sessao) {
    await prisma.eventoEngajamento.create({
      data: { estudanteId: sessao.sub, tipoEvento: "LOGOUT" },
    });
  }
  await encerrarSessaoEstudante();
  return NextResponse.json({ ok: true });
}
