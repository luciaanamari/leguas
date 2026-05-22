import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashCpf } from '@/lib/hash';

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { cpf?: string } | null;
  const cpf = typeof body?.cpf === 'string' ? body.cpf.replace(/\D/g, '') : '';

  if (cpf.length !== 11) {
    return NextResponse.json({ existe: false });
  }

  const cpfHash = hashCpf(cpf);
  const encontrado = await prisma.estudante.findUnique({
    where: { cpfHash },
    select: { id: true },
  });

  return NextResponse.json({ existe: !!encontrado });
}
