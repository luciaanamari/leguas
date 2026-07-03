import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { escopoDeQuery, lerEscopoAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  const escopo = await lerEscopoAdmin();
  if (!escopo) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const url = new URL(req.url);
  const q = url.searchParams.get("q");
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
  const take = 20;

  const filtros: Prisma.EstudanteWhereInput[] = [escopoDeQuery(escopo)];
  if (q) {
    filtros.push({ nome: { contains: q, mode: "insensitive" } });
  }
  const where: Prisma.EstudanteWhereInput = { AND: filtros };

  const [total, estudantes] = await Promise.all([
    prisma.estudante.count({ where }),
    prisma.estudante.findMany({
      where,
      orderBy: { criadoEm: "desc" },
      skip: (page - 1) * take,
      take,
      select: {
        id: true,
        nome: true,
        escolaNome: true,
        escolaId: true,
        escolaAno: true,
        discPerfil: true,
        ativo: true,
        criadoEm: true,
        escola: { select: { id: true, nome: true } },
      },
    }),
  ]);

  return NextResponse.json({ estudantes, total, page, take });
}
