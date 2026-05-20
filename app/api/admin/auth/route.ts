import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { criarSessaoAdmin } from "@/lib/auth";
import { loginAdminSchema } from "@/lib/validations/cadastro";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = loginAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", detalhes: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const admin = await prisma.admin.findUnique({ where: { email: parsed.data.email } });
  if (!admin || !admin.ativo) {
    return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
  }

  const ok = await bcrypt.compare(parsed.data.senha, admin.senhaHash);
  if (!ok) {
    return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
  }

  await criarSessaoAdmin(admin.id);
  return NextResponse.json({ id: admin.id, nome: admin.nome, role: admin.role });
}
