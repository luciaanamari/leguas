import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { lerSessaoAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  if (!(await lerSessaoAdmin())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const url = new URL(req.url);
  const q = url.searchParams.get("q");
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
  const take = 20;

  const where = q
    ? { nome: { contains: q, mode: "insensitive" as const } }
    : {};

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
        escolaAno: true,
        discPerfil: true,
        ativo: true,
        criadoEm: true,
      },
    }),
  ]);

  return NextResponse.json({ estudantes, total, page, take });
}
