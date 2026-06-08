import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { email?: string } | null;
  // Mesma normalizacao do cadastroSchema (trim + lowercase).
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email || !emailRegex.test(email)) {
    return NextResponse.json({ valido: false, existe: false });
  }

  const encontrado = await prisma.estudante.findUnique({
    where: { email },
    select: { id: true },
  });

  return NextResponse.json({ valido: true, existe: !!encontrado });
}
