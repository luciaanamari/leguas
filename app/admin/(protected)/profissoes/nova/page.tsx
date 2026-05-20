import Link from "next/link";
import { prisma } from "@/lib/db";
import FormularioProfissao from "@/components/admin/FormularioProfissao";

export default async function NovaProfissaoPage() {
  const trilhas = await prisma.trilha.findMany({
    where: { ativo: true },
    orderBy: { titulo: "asc" },
    select: { id: true, titulo: true },
  });
  return (
    <div>
      <Link href="/admin/profissoes" className="muted" style={{ textDecoration: "none" }}>
        ← voltar
      </Link>
      <h1 style={{ fontSize: "1.75rem", marginTop: "1rem", marginBottom: "1.5rem" }}>
        Nova profissão
      </h1>
      <FormularioProfissao trilhas={trilhas} />
    </div>
  );
}
