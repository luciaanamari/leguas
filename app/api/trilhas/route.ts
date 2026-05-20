import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { ModalidadeTrilha } from "@prisma/client";

const modalidadesValidas: ModalidadeTrilha[] = [
  "PRESENCIAL",
  "EAD",
  "TECNICO",
  "CONCURSO",
  "MERCADO",
];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const m = url.searchParams.get("modalidade")?.toUpperCase();
  const filtro =
    m && (modalidadesValidas as string[]).includes(m) ? (m as ModalidadeTrilha) : null;

  const trilhas = await prisma.trilha.findMany({
    where: { ativo: true, ...(filtro ? { modalidade: filtro } : {}) },
    orderBy: { ordem: "asc" },
    select: {
      id: true,
      slug: true,
      titulo: true,
      modalidade: true,
      descricaoCurta: true,
      duracao: true,
      custoEstimado: true,
    },
  });

  return NextResponse.json({ trilhas });
}
