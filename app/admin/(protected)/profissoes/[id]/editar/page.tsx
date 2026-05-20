import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import FormularioProfissao from "@/components/admin/FormularioProfissao";

type Params = Promise<{ id: string }>;

export default async function EditarProfissaoPage({ params }: { params: Params }) {
  const { id } = await params;
  const [profissao, trilhas] = await Promise.all([
    prisma.profissao.findUnique({ where: { id } }),
    prisma.trilha.findMany({
      orderBy: { titulo: "asc" },
      select: { id: true, titulo: true },
    }),
  ]);
  if (!profissao) notFound();
  return (
    <div>
      <Link href="/admin/profissoes" className="muted" style={{ textDecoration: "none" }}>
        ← voltar
      </Link>
      <h1 style={{ fontSize: "1.75rem", marginTop: "1rem", marginBottom: "1.5rem" }}>
        Editar profissão
      </h1>
      <FormularioProfissao profissao={profissao} trilhas={trilhas} />
    </div>
  );
}
